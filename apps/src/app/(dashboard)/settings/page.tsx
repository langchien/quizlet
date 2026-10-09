"use client"

import * as React from "react"
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Keyboard,
  Brain,
  Download,
  Save,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useLearningPreferences } from "@/hooks/settings"
import {
  SettingsProfileTab,
  SettingsAppearanceTab,
  SettingsLearningTab,
  SettingsShortcutsTab,
  SettingsDataTab,
} from "@/components/settings"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("profile")

  const {
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
  } = useLearningPreferences()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <SettingsIcon className="text-primary size-7" />
            <span>Cài đặt hệ thống</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tùy biến tài khoản, giao diện hiển thị, phương pháp ghi nhớ SRS và
            phím tắt thông minh.
          </p>
        </div>

        <Button
          onClick={handleSaveAllSettings}
          disabled={savingSettings}
          className="gap-2 self-start shadow-sm sm:self-auto"
        >
          <Save className="size-4" />
          <span>{savingSettings ? "Đang lưu..." : "Lưu tất cả cài đặt"}</span>
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-6"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1.5 sm:grid-cols-5">
          <TabsTrigger
            value="profile"
            className="gap-2 py-2 text-xs font-medium"
          >
            <User className="size-4" />
            <span>Hồ sơ</span>
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="gap-2 py-2 text-xs font-medium"
          >
            <Moon className="size-4" />
            <span>Giao diện</span>
          </TabsTrigger>
          <TabsTrigger value="study" className="gap-2 py-2 text-xs font-medium">
            <Brain className="size-4" />
            <span>Học & SRS</span>
          </TabsTrigger>
          <TabsTrigger
            value="shortcuts"
            className="gap-2 py-2 text-xs font-medium"
          >
            <Keyboard className="size-4" />
            <span>Phím tắt</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2 py-2 text-xs font-medium">
            <Download className="size-4" />
            <span>Dữ liệu</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <SettingsProfileTab />
        </TabsContent>

        <TabsContent value="appearance">
          <SettingsAppearanceTab
            theme={theme}
            setTheme={setTheme}
            fontSize={fontSize}
            setFontSize={setFontSize}
            japaneseFont={japaneseFont}
            setJapaneseFont={setJapaneseFont}
          />
        </TabsContent>

        <TabsContent value="study">
          <SettingsLearningTab
            srsMode={srsMode}
            setSrsMode={setSrsMode}
            dailyGoalCards={dailyGoalCards}
            setDailyGoalCards={setDailyGoalCards}
            dailyTimeTarget={dailyTimeTarget}
            setDailyTimeTarget={setDailyTimeTarget}
            autoPlayAudio={autoPlayAudio}
            setAutoPlayAudio={setAutoPlayAudio}
            ttsRate={ttsRate}
            setTtsRate={setTtsRate}
            ttsVoice={ttsVoice}
            setTtsVoice={setTtsVoice}
            voices={voices}
            isPlaying={isPlaying}
            handleTestTTS={handleTestTTS}
          />
        </TabsContent>

        <TabsContent value="shortcuts">
          <SettingsShortcutsTab
            keyboardShortcutsEnabled={keyboardShortcutsEnabled}
            setKeyboardShortcutsEnabled={setKeyboardShortcutsEnabled}
          />
        </TabsContent>

        <TabsContent value="data">
          <SettingsDataTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
