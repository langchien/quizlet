"use client"

import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FontSizeOption } from "@/hooks/settings/use-learning-preferences"
import { SettingsThemeSelector } from "./settings-theme-selector"
import { SettingsFontPreferences } from "./settings-font-preferences"

export interface SettingsAppearanceTabProps {
  theme: string | undefined
  setTheme: (theme: string) => void
  fontSize: FontSizeOption
  setFontSize: (fontSize: FontSizeOption) => void
  japaneseFont: string
  setJapaneseFont: (font: string) => void
}

export function SettingsAppearanceTab({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  japaneseFont,
  setJapaneseFont,
}: SettingsAppearanceTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Chủ đề & Màu sắc</CardTitle>
        <CardDescription>
          Tùy chỉnh phong cách giao diện sáng, tối hoặc tự động theo hệ điều
          hành.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <SettingsThemeSelector theme={theme} onThemeChange={setTheme} />

        <Separator />

        <SettingsFontPreferences
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          japaneseFont={japaneseFont}
          onJapaneseFontChange={setJapaneseFont}
        />
      </CardContent>
    </Card>
  )
}
