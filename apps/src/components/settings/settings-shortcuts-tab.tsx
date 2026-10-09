"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export interface SettingsShortcutsTabProps {
  keyboardShortcutsEnabled: boolean
  setKeyboardShortcutsEnabled: (enabled: boolean) => void
}

const SHORTCUT_ITEMS = [
  { action: "Lật thẻ Flashcard / Xác nhận", key: "Space" },
  { action: "Chuyển thẻ Trước / Kế tiếp", keys: ["←", "→"] },
  { action: "Đánh giá thẻ: Chưa biết / Lặp lại", key: "1" },
  { action: "Đánh giá thẻ: Đã nhớ / Tốt", key: "2" },
  { action: "Phát âm âm thanh tiếng Nhật (TTS)", key: "A" },
  { action: "Bật / Tắt xáo trộn (Shuffle)", key: "S" },
  { action: "Lật ngược câu hỏi / trả lời (Reverse)", key: "R" },
  { action: "Tìm kiếm toàn cục", key: "Ctrl + K / ⌘ + K" },
  { action: "Mở bảng tra cứu phím tắt", key: "?" },
]

export function SettingsShortcutsTab({
  keyboardShortcutsEnabled,
  setKeyboardShortcutsEnabled,
}: SettingsShortcutsTabProps) {
  const handleResetShortcuts = () => {
    setKeyboardShortcutsEnabled(true)
    toast.success("Đã khôi phục phím tắt về mặc định.")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Phím tắt thông minh</CardTitle>
            <CardDescription>
              Tăng tốc độ ôn luyện thẻ và điều hướng hệ thống bằng bàn phím.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Bật phím tắt</span>
            <Switch
              checked={keyboardShortcutsEnabled}
              onCheckedChange={setKeyboardShortcutsEnabled}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="border-border/60 divide-border/40 divide-y rounded-xl border">
          <div className="bg-muted/20 flex items-center justify-between p-3 text-xs font-semibold">
            <span className="text-foreground">Thao tác</span>
            <span className="text-foreground">Phím bấm mặc định</span>
          </div>

          {SHORTCUT_ITEMS.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 text-xs"
            >
              <span className="text-muted-foreground">{item.action}</span>
              {item.keys ? (
                <div className="flex items-center gap-1">
                  {item.keys.map((k) => (
                    <kbd
                      key={k}
                      className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              ) : (
                <kbd className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                  {item.key}
                </kbd>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-muted-foreground text-xs">
            Nhấn{" "}
            <kbd className="border-border bg-muted rounded border px-1.5 py-0.5 font-mono text-[10px]">
              ?
            </kbd>{" "}
            ở bất kỳ đâu để xem cheatsheet phím tắt nhanh.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetShortcuts}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Khôi phục mặc định</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
