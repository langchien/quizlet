"use client"

import * as React from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useTheme } from "next-themes"
import { useTTS } from "@/hooks/useTTS"
import { api } from "@/lib/api"
import { toast } from "sonner"

export type FontSizeOption = "sm" | "md" | "lg"
export type SrsModeOption = "auto" | "simple" | "advanced"

export function useLearningPreferences() {
  const { user, setUser } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const { speak, isPlaying, voices } = useTTS()

  const [savingSettings, setSavingSettings] = React.useState(false)

  // Appearance State
  const [fontSize, setFontSize] = React.useState<FontSizeOption>("md")
  const [japaneseFont, setJapaneseFont] = React.useState("noto")

  // Study & SRS State
  const [srsMode, setSrsMode] = React.useState<SrsModeOption>("auto")
  const [dailyGoalCards, setDailyGoalCards] = React.useState(20)
  const [dailyTimeTarget, setDailyTimeTarget] = React.useState(15)
  const [autoPlayAudio, setAutoPlayAudio] = React.useState(true)
  const [ttsRate, setTtsRate] = React.useState(1.0)
  const [ttsVoice, setTtsVoice] = React.useState("")

  // Keyboard Shortcuts State
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] =
    React.useState(true)

  // Đồng bộ state khi user data đã tải
  React.useEffect(() => {
    if (user) {
      const userSettings =
        user.settings && typeof user.settings === "object"
          ? (user.settings as Record<string, unknown>)
          : {}

      if (userSettings.fontSize)
        setFontSize(userSettings.fontSize as FontSizeOption)
      if (userSettings.japaneseFont)
        setJapaneseFont(String(userSettings.japaneseFont))
      if (userSettings.srsMode)
        setSrsMode(userSettings.srsMode as SrsModeOption)
      if (userSettings.dailyGoal)
        setDailyGoalCards(Number(userSettings.dailyGoal))
      if (userSettings.dailyTimeTarget)
        setDailyTimeTarget(Number(userSettings.dailyTimeTarget))
      if (userSettings.autoPlayAudio !== undefined)
        setAutoPlayAudio(Boolean(userSettings.autoPlayAudio))
      if (userSettings.ttsRate) setTtsRate(Number(userSettings.ttsRate))
      if (userSettings.ttsVoice) setTtsVoice(String(userSettings.ttsVoice))
      if (userSettings.keyboardShortcuts !== undefined) {
        setKeyboardShortcutsEnabled(Boolean(userSettings.keyboardShortcuts))
      }

      // Lấy từ UserGoal nếu có
      if (user.goal && typeof user.goal === "object") {
        const goal = user.goal as {
          dailyCardTarget?: number
          dailyTimeTarget?: number
        }
        if (goal.dailyCardTarget) setDailyGoalCards(goal.dailyCardTarget)
        if (goal.dailyTimeTarget) setDailyTimeTarget(goal.dailyTimeTarget)
      }
    }
  }, [user])

  // Lưu cài đặt chung (Appearance, Study, Shortcuts)
  const handleSaveAllSettings = async () => {
    setSavingSettings(true)
    try {
      const payloadSettings = {
        theme,
        fontSize,
        japaneseFont,
        srsMode,
        dailyGoal: dailyGoalCards,
        dailyTimeTarget,
        keyboardShortcuts: keyboardShortcutsEnabled,
        autoPlayAudio,
        ttsRate,
        ttsVoice: ttsVoice || undefined,
      }

      const res = await api.patch("/api/auth/me", {
        settings: payloadSettings,
      })

      if (res.data?.user) {
        setUser(res.data.user)
      }
      toast.success("Đã lưu các thiết lập cài đặt!")
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined
      toast.error(errorMsg || "Lỗi khi lưu cài đặt.")
    } finally {
      setSavingSettings(false)
    }
  }

  // Thử giọng phát âm tiếng Nhật
  const handleTestTTS = () => {
    speak(
      "こんにちは、日本語の勉強を始めましょう！",
      ttsRate,
      ttsVoice || undefined
    )
  }

  return {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    japaneseFont,
    setJapaneseFont,
    srsMode,
    setSrsMode,
    dailyGoalCards,
    setDailyGoalCards,
    dailyTimeTarget,
    setDailyTimeTarget,
    autoPlayAudio,
    setAutoPlayAudio,
    ttsRate,
    setTtsRate,
    ttsVoice,
    setTtsVoice,
    keyboardShortcutsEnabled,
    setKeyboardShortcutsEnabled,
    savingSettings,
    handleSaveAllSettings,
    handleTestTTS,
    isPlaying,
    voices,
  }
}
