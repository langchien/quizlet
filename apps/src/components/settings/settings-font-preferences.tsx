"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import { FontSizeOption } from "@/hooks/settings/use-learning-preferences"

export interface SettingsFontPreferencesProps {
  fontSize: FontSizeOption
  onFontSizeChange: (fontSize: FontSizeOption) => void
  japaneseFont: string
  onJapaneseFontChange: (font: string) => void
}

const FONT_SIZE_OPTIONS = [
  { value: "sm", label: "Nhỏ gọn (Thích hợp màn hình nhỏ)" },
  { value: "md", label: "Tiêu chuẩn (Khuyên dùng)" },
  { value: "lg", label: "Lớn & Rõ nét (Dễ nhìn chữ Hán phức tạp)" },
]

const JAPANESE_FONT_OPTIONS = [
  { value: "noto", label: "Noto Sans JP (Chuẩn mực Google Fonts)" },
  { value: "gothic", label: "Zen Kaku Gothic (Hiện đại, nét thanh)" },
  { value: "maru", label: "Kosugi Maru (Tròn trịa dễ thương)" },
]

export function SettingsFontPreferences({
  fontSize,
  onFontSizeChange,
  japaneseFont,
  onJapaneseFontChange,
}: SettingsFontPreferencesProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="fontSize" className="text-xs font-semibold">
          Kích cỡ font thẻ học
        </FieldLabel>
        <Select
          items={FONT_SIZE_OPTIONS}
          value={fontSize}
          onValueChange={(val) =>
            val && onFontSizeChange(val as FontSizeOption)
          }
        >
          <SelectTrigger id="fontSize" className="w-full">
            <SelectValue placeholder="Chọn kích cỡ font" />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="japaneseFont" className="text-xs font-semibold">
          Font chữ tiếng Nhật hiển thị
        </FieldLabel>
        <Select
          items={JAPANESE_FONT_OPTIONS}
          value={japaneseFont}
          onValueChange={(val) => val && onJapaneseFontChange(val)}
        >
          <SelectTrigger id="japaneseFont" className="w-full">
            <SelectValue placeholder="Chọn font chữ" />
          </SelectTrigger>
          <SelectContent>
            {JAPANESE_FONT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}
