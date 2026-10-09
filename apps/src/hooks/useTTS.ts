"use client"

import * as React from "react"
import { toast } from "sonner"

export function useTTS() {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [rate, setRate] = React.useState(0.9)

  const speak = React.useCallback(
    (text: string, customRate?: number) => {
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

      // Tìm giọng ja-JP nếu có
      const voices = window.speechSynthesis.getVoices()
      const jaVoice = voices.find(
        (v) => v.lang === "ja-JP" || v.lang.startsWith("ja")
      )
      if (jaVoice) {
        utterance.voice = jaVoice
      }

      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)

      window.speechSynthesis.speak(utterance)
    },
    [rate]
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
  }
}
