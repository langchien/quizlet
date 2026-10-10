"use client"

import * as React from "react"
import { Keyboard, Sparkles, BookOpen, Navigation } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface ShortcutsCheatsheetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ShortcutGroup {
  category: string
  icon: React.ElementType
  items: Array<{
    keyLabel: string
    description: string
  }>
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: "Chế độ học tập (Study)",
    icon: BookOpen,
    items: [
      {
        keyLabel: "Space",
        description: "Lật thẻ Flashcard / Xác nhận câu trả lời",
      },
      { keyLabel: "← / →", description: "Chuyển về thẻ trước / thẻ kế tiếp" },
      {
        keyLabel: "1",
        description: "Đánh giá: Chưa biết / Cần lặp lại (Again)",
      },
      { keyLabel: "2", description: "Đánh giá: Đã nhớ / Tốt (Good)" },
      { keyLabel: "3", description: "Đánh giá: Khó (Hard)" },
      { keyLabel: "4", description: "Đánh giá: Rất dễ (Easy)" },
      { keyLabel: "A", description: "Phát âm từ vựng tiếng Nhật (TTS)" },
      { keyLabel: "S", description: "Bật / tắt xáo trộn ngẫu nhiên (Shuffle)" },
      {
        keyLabel: "R",
        description: "Lật ngược thuật ngữ / định nghĩa (Reverse)",
      },
    ],
  },
  {
    category: "Điều hướng & Hệ thống (Global)",
    icon: Navigation,
    items: [
      {
        keyLabel: "Ctrl + K / ⌘ + K",
        description: "Mở thanh tìm kiếm toàn cục",
      },
      { keyLabel: "?", description: "Mở bảng tra cứu phím tắt này" },
      { keyLabel: "Esc", description: "Đóng hộp thoại / Huỷ chọn" },
    ],
  },
]

export function ShortcutsCheatsheetModal({
  open,
  onOpenChange,
}: ShortcutsCheatsheetModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <Keyboard className="size-4" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2 text-base">
                <span>Bảng tra cứu phím tắt</span>
                <Badge variant="outline" className="text-[10px] font-normal">
                  <Sparkles className="mr-1 size-3 text-amber-500" />
                  Mẹo học nhanh
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Sử dụng bàn phím giúp bạn thao tác học thẻ nhanh và tập trung
                hơn.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-6">
          {SHORTCUT_GROUPS.map((group) => {
            const Icon = group.icon
            return (
              <div key={group.category} className="flex flex-col gap-2.5">
                <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
                  <Icon className="text-primary size-3.5" />
                  <span>{group.category}</span>
                </div>

                <div className="border-border/60 bg-muted/20 divide-border/40 divide-y rounded-xl border">
                  {group.items.map((item) => (
                    <div
                      key={item.keyLabel}
                      className="hover:bg-muted/40 flex items-center justify-between px-3.5 py-2 text-xs transition-colors"
                    >
                      <span className="text-muted-foreground">
                        {item.description}
                      </span>
                      <kbd className="border-border bg-card text-foreground rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold shadow-2xs">
                        {item.keyLabel}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
