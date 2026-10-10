"use client"

import * as React from "react"
import { toast } from "sonner"

export interface AudioPronounceOptions {
  defaultRate?: number
  defaultPitch?: number
  shortcutKey?: string
  enabled?: boolean
}

export interface SpeakOptions {
  rate?: number
  pitch?: number
  voiceURI?: string
}

export function useAudioPronounce(options?: AudioPronounceOptions) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentText, setCurrentText] = React.useState<string | null>(null)
  const [rate, setRate] = React.useState(options?.defaultRate ?? 0.9)
  const [pitch, setPitch] = React.useState(options?.defaultPitch ?? 1.0)
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([])

  // Cập nhật danh sách voices
  const updateVoices = React.useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return

    const availableVoices = window.speechSynthesis.getVoices()
    const jaVoices = availableVoices.filter(
      (v) => v.lang === "ja-JP" || v.lang.startsWith("ja")
    )
    setVoices(jaVoices.length > 0 ? jaVoices : availableVoices)
  }, [])

  React.useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return

    updateVoices()

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [updateVoices])

  // Dừng phát âm
  const stop = React.useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
    setCurrentText(null)
  }, [])

  // Phát âm từ vựng
  const speak = React.useCallback(
    (text: string, speakOpts?: SpeakOptions) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        toast.error("Trình duyệt không hỗ trợ tổng hợp giọng nói tiếng Nhật.")
        return
      }

      window.speechSynthesis.cancel()

      // Làm sạch text (bỏ thẻ html, furigana ngoặc kép nếu có)
      const cleanText = text.replace(/<[^>]*>/g, "").trim()
      if (!cleanText) return

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = "ja-JP"
      utterance.rate = speakOpts?.rate ?? rate
      utterance.pitch = speakOpts?.pitch ?? pitch

      const allVoices = window.speechSynthesis.getVoices()
      const targetURI = speakOpts?.voiceURI
      if (targetURI) {
        const found = allVoices.find((v) => v.voiceURI === targetURI)
        if (found) utterance.voice = found
      } else {
        const jaVoice = allVoices.find(
          (v) => v.lang === "ja-JP" || v.lang.startsWith("ja")
        )
        if (jaVoice) utterance.voice = jaVoice
      }

      utterance.onstart = () => {
        setIsPlaying(true)
        setCurrentText(cleanText)
      }

      utterance.onend = () => {
        setIsPlaying(false)
        setCurrentText(null)
      }

      utterance.onerror = (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("TTS Audio error:", e)
        }
        setIsPlaying(false)
        setCurrentText(null)
      }

      window.speechSynthesis.speak(utterance)
    },
    [rate, pitch]
  )

  // Lắng nghe phím tắt nếu có
  React.useEffect(() => {
    if (!options?.shortcutKey || options?.enabled === false) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return
      }

      if (e.key.toLowerCase() === options.shortcutKey?.toLowerCase()) {
        e.preventDefault()
        if (currentText) {
          speak(currentText)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [options?.shortcutKey, options?.enabled, currentText, speak])

  // Dọn dẹp khi unmount
  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return {
    speak,
    stop,
    isPlaying,
    currentText,
    voices,
    rate,
    setRate,
    pitch,
    setPitch,
  }
}
