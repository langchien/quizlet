"use client"

import * as React from "react"
import { useAuthStore } from "@/stores/useAuthStore"

export interface ShortcutHandlers {
  onFlip?: () => void
  onPrev?: () => void
  onNext?: () => void
  onAnswerAgain?: () => void
  onAnswerGood?: () => void
  onAnswerHard?: () => void
  onAnswerEasy?: () => void
  onShuffle?: () => void
  onReverse?: () => void
  onSpeak?: () => void
  onOpenCheatsheet?: () => void
}

export interface ShortcutItem {
  id: string
  label: string
  description: string
  defaultKey: string
  currentKey: string
  category: "study" | "navigation" | "global"
}

export const DEFAULT_SHORTCUTS: Record<string, string> = {
  flip: "Space",
  prev: "ArrowLeft",
  next: "ArrowRight",
  answerAgain: "1",
  answerGood: "2",
  answerHard: "3",
  answerEasy: "4",
  shuffle: "s",
  reverse: "r",
  speak: "a",
  cheatsheet: "?",
}

export function useKeyboardShortcuts(
  handlers: ShortcutHandlers,
  options?: {
    enabled?: boolean
    ignoreInputs?: boolean
  }
) {
  const { enabled = true, ignoreInputs = true } = options ?? {}
  const { user } = useAuthStore()

  // Kiểm tra user có tắt keyboardShortcuts trong settings không
  const isEnabledInSettings =
    user?.settings && typeof user.settings === "object"
      ? (user.settings as Record<string, unknown>).keyboardShortcuts !== false
      : true

  const activeEnabled = enabled && isEnabledInSettings

  React.useEffect(() => {
    if (!activeEnabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang gõ trong input, textarea hoặc contenteditable
      if (
        ignoreInputs &&
        (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement)?.isContentEditable)
      ) {
        return
      }

      // Giữ nguyên các tổ hợp phím hệ thống như Ctrl+C, Ctrl+V, v.v. (trừ trường hợp muốn bắt riêng)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return
      }

      // 1. Phím hiển thị Cheatsheet: '?' (Shift + /)
      if (e.key === "?" || (e.shiftKey && e.code === "Slash")) {
        if (handlers.onOpenCheatsheet) {
          e.preventDefault()
          handlers.onOpenCheatsheet()
          return
        }
      }

      // 2. Space: Flip hoặc Confirm
      if (e.code === "Space") {
        if (handlers.onFlip) {
          e.preventDefault()
          handlers.onFlip()
          return
        }
      }

      // 3. ArrowLeft / ArrowRight
      if (e.code === "ArrowLeft") {
        if (handlers.onPrev) {
          e.preventDefault()
          handlers.onPrev()
          return
        }
      }

      if (e.code === "ArrowRight") {
        if (handlers.onNext) {
          e.preventDefault()
          handlers.onNext()
          return
        }
      }

      // 4. Số 1, 2, 3, 4 đánh giá kết quả
      if (e.code === "Digit1" || e.code === "Numpad1" || e.key === "1") {
        if (handlers.onAnswerAgain) {
          e.preventDefault()
          handlers.onAnswerAgain()
          return
        }
      }

      if (e.code === "Digit2" || e.code === "Numpad2" || e.key === "2") {
        if (handlers.onAnswerGood) {
          e.preventDefault()
          handlers.onAnswerGood()
          return
        }
      }

      if (e.code === "Digit3" || e.code === "Numpad3" || e.key === "3") {
        if (handlers.onAnswerHard) {
          e.preventDefault()
          handlers.onAnswerHard()
          return
        }
      }

      if (e.code === "Digit4" || e.code === "Numpad4" || e.key === "4") {
        if (handlers.onAnswerEasy) {
          e.preventDefault()
          handlers.onAnswerEasy()
          return
        }
      }

      // 5. Phím S (Shuffle)
      if (e.code === "KeyS" || e.key.toLowerCase() === "s") {
        if (handlers.onShuffle) {
          e.preventDefault()
          handlers.onShuffle()
          return
        }
      }

      // 6. Phím R (Reverse)
      if (e.code === "KeyR" || e.key.toLowerCase() === "r") {
        if (handlers.onReverse) {
          e.preventDefault()
          handlers.onReverse()
          return
        }
      }

      // 7. Phím A (Audio TTS)
      if (e.code === "KeyA" || e.key.toLowerCase() === "a") {
        if (handlers.onSpeak) {
          e.preventDefault()
          handlers.onSpeak()
          return
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeEnabled, ignoreInputs, handlers])
}
