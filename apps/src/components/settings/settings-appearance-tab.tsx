"use client"

import * as React from "react"
import { Sun, Moon, Laptop } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { FontSizeOption } from "@/hooks/settings/use-learning-preferences"
import { cn } from "@/lib/utils"

export interface SettingsAppearanceTabProps {
  theme: string | undefined
  setTheme: (theme: string) => void
  fontSize: FontSizeOption
  setFontSize: (fontSize: FontSizeOption) => void
  japaneseFont: string
  setJapaneseFont: (font: string) => void
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
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={cn(
              "border-border hover:bg-muted/50 flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
              theme === "light" &&
                "border-primary bg-primary/5 ring-primary/20 ring-2"
            )}
          >
            <Sun className="size-6 text-amber-500" />
            <span className="text-foreground text-xs font-semibold">
              Chế độ Sáng
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={cn(
              "border-border hover:bg-muted/50 flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
              theme === "dark" &&
                "border-primary bg-primary/5 ring-primary/20 ring-2"
            )}
          >
            <Moon className="text-primary size-6" />
            <span className="text-foreground text-xs font-semibold">
              Chế độ Tối
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={cn(
              "border-border hover:bg-muted/50 flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
              theme === "system" &&
                "border-primary bg-primary/5 ring-primary/20 ring-2"
            )}
          >
            <Laptop className="text-muted-foreground size-6" />
            <span className="text-foreground text-xs font-semibold">
              Theo Hệ thống
            </span>
          </button>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="fontSize" className="text-xs font-semibold">
              Kích cỡ font thẻ học
            </FieldLabel>
            <Select
              items={FONT_SIZE_OPTIONS}
              value={fontSize}
              onValueChange={(val) => val && setFontSize(val as FontSizeOption)}
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
            <FieldLabel
              htmlFor="japaneseFont"
              className="text-xs font-semibold"
            >
              Font chữ tiếng Nhật hiển thị
            </FieldLabel>
            <Select
              items={JAPANESE_FONT_OPTIONS}
              value={japaneseFont}
              onValueChange={(val) => val && setJapaneseFont(val)}
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
      </CardContent>
    </Card>
  )
}
