"use client"

import * as React from "react"
import { toast } from "sonner"

export interface VoiceOption {
  name: string
  lang: string
  voiceURI: string
  default: boolean
}

interface UseTTSOptions {
  defaultRate?: number
  defaultVoiceURI?: string
  pitch?: number
}

export function useTTS(options?: UseTTSOptions) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [rate, setRate] = React.useState(options?.defaultRate ?? 0.9)
  const [pitch, setPitch] = React.useState(options?.pitch ?? 1.0)
  const [voices, setVoices] = React.useState<VoiceOption[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = React.useState<
    string | undefined
  >(options?.defaultVoiceURI)

  // Tải danh sách voice tiếng Nhật
  const updateVoices = React.useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return

    const availableVoices = window.speechSynthesis.getVoices()
    const jaVoices = availableVoices
      .filter((v) => v.lang === "ja-JP" || v.lang.startsWith("ja"))
      .map((v) => ({
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        default: v.default,
      }))

    setVoices(jaVoices)

    // Nếu chưa chọn giọng hoặc giọng đã chọn không tồn tại, tự chọn giọng đầu tiên
    if (jaVoices.length > 0 && !selectedVoiceURI) {
      const defaultJa = jaVoices.find((v) => v.default) || jaVoices[0]
      setSelectedVoiceURI(defaultJa.voiceURI)
    }
  }, [selectedVoiceURI])

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

  const speak = React.useCallback(
    (text: string, customRate?: number, customVoiceURI?: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        toast.error("Trình duyệt không hỗ trợ phát âm tiếng Nhật.")
        return
      }

      window.speechSynthesis.cancel()

      const cleanText = text.replace(/<[^>]*>/g, "").trim()
      if (!cleanText) return

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = "ja-JP"
      utterance.rate = customRate ?? rate
      utterance.pitch = pitch

      // Lấy danh sách giọng từ hệ thống
      const allVoices = window.speechSynthesis.getVoices()
      const targetURI = customVoiceURI ?? selectedVoiceURI

      if (targetURI) {
        const found = allVoices.find((v) => v.voiceURI === targetURI)
        if (found) {
          utterance.voice = found
        }
      }

      // Nếu chưa có voice được gán, tìm voice ja-JP đầu tiên
      if (!utterance.voice) {
        const jaVoice = allVoices.find(
          (v) => v.lang === "ja-JP" || v.lang.startsWith("ja")
        )
        if (jaVoice) {
          utterance.voice = jaVoice
        }
      }

      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = (e) => {
        // Bỏ qua lỗi canceled khi người dùng nhấn chuyển thẻ nhanh
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.error("TTS error:", e)
        }
        setIsPlaying(false)
      }

      window.speechSynthesis.speak(utterance)
    },
    [rate, pitch, selectedVoiceURI]
  )

  const stop = React.useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    }
  }, [])

  return {
    speak,
    stop,
    isPlaying,
    rate,
    setRate,
    pitch,
    setPitch,
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
  }
}
