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
import { Label } from "@/components/ui/label"
import { NativeSelect as Select } from "@/components/ui/native-select"
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="fontSize">Kích cỡ font thẻ học</Label>
            <Select
              id="fontSize"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as FontSizeOption)}
            >
              <option value="sm">Nhỏ gọn (Thích hợp màn hình nhỏ)</option>
              <option value="md">Tiêu chuẩn (Khuyên dùng)</option>
              <option value="lg">
                Lớn & Rõ nét (Dễ nhìn chữ Hán phức tạp)
              </option>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="japaneseFont">Font chữ tiếng Nhật hiển thị</Label>
            <Select
              id="japaneseFont"
              value={japaneseFont}
              onChange={(e) => setJapaneseFont(e.target.value)}
            >
              <option value="noto">
                Noto Sans JP (Chuẩn mực Google Fonts)
              </option>
              <option value="gothic">
                Zen Kaku Gothic (Hiện đại, nét thanh)
              </option>
              <option value="maru">Kosugi Maru (Tròn trịa dễ thương)</option>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
