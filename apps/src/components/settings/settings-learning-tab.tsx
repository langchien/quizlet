"use client"

import * as React from "react"
import { SrsModeOption } from "@/hooks/settings/use-learning-preferences"
import { VoiceOption } from "@/hooks/useTTS"
import { SettingsSrsCard } from "./settings-srs-card"
import { SettingsTtsCard } from "./settings-tts-card"

export interface SettingsLearningTabProps {
  srsMode: SrsModeOption
  setSrsMode: (mode: SrsModeOption) => void
  dailyGoalCards: number
  setDailyGoalCards: (cards: number) => void
  dailyTimeTarget: number
  setDailyTimeTarget: (time: number) => void
  autoPlayAudio: boolean
  setAutoPlayAudio: (autoPlay: boolean) => void
  ttsRate: number
  setTtsRate: (rate: number) => void
  ttsVoice: string
  setTtsVoice: (voice: string) => void
  voices: VoiceOption[]
  isPlaying: boolean
  handleTestTTS: () => void
}

export function SettingsLearningTab({
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
  voices,
  isPlaying,
  handleTestTTS,
}: SettingsLearningTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <SettingsSrsCard
        srsMode={srsMode}
        setSrsMode={setSrsMode}
        dailyGoalCards={dailyGoalCards}
        setDailyGoalCards={setDailyGoalCards}
        dailyTimeTarget={dailyTimeTarget}
        setDailyTimeTarget={setDailyTimeTarget}
      />

      <SettingsTtsCard
        autoPlayAudio={autoPlayAudio}
        setAutoPlayAudio={setAutoPlayAudio}
        ttsRate={ttsRate}
        setTtsRate={setTtsRate}
        ttsVoice={ttsVoice}
        setTtsVoice={setTtsVoice}
        voices={voices}
        isPlaying={isPlaying}
        onTestTTS={handleTestTTS}
      />
    </div>
  )
}
