"use client"

import * as React from "react"
import {
  Sparkles,
  Layers,
  BrainCircuit,
  Pencil,
  Play,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { MistakeReviewMode } from "@/types/mistakes"

interface MistakesQuickStudyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemsCount: number
  chosenMode: MistakeReviewMode
  onChosenModeChange: (mode: MistakeReviewMode) => void
  isStartingReview: boolean
  onStartReview: () => void
}

const REVIEW_MODES = [
  {
    mode: "Flashcard" as const,
    title: "Flashcard 3D",
    desc: "Lật thẻ và tự đánh giá mức độ ghi nhớ từ vựng.",
    icon: Layers,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    mode: "Learn" as const,
    title: "Học thích ứng (Learn)",
    desc: "Trắc nghiệm thông minh kết hợp tự điền từ.",
    icon: BrainCircuit,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    mode: "Write" as const,
    title: "Luyện viết (Write)",
    desc: "Gõ lại chính xác từ vựng tiếng Nhật để khắc phục lỗi.",
    icon: Pencil,
    color: "text-amber-500 bg-amber-500/10",
  },
]

export function MistakesQuickStudyDialog({
  open,
  onOpenChange,
  itemsCount,
  chosenMode,
  onChosenModeChange,
  isStartingReview,
  onStartReview,
}: MistakesQuickStudyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-base font-bold">
            <Sparkles className="size-5 text-rose-500" />
            <span>Chọn chế độ ôn tập lỗi sai</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Hệ thống sẽ lấy {itemsCount} thẻ từ vựng trong danh sách lỗi sai này
            để tạo một phiên học tập trung.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 py-3">
          {REVIEW_MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              onClick={() => onChosenModeChange(m.mode)}
              className={cn(
                "border-border flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all",
                chosenMode === m.mode
                  ? "border-primary bg-primary/5 ring-primary/20 ring-2"
                  : "hover:bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  m.color
                )}
              >
                <m.icon className="size-5" />
              </div>
              <div>
                <div className="text-foreground text-xs font-bold">
                  {m.title}
                </div>
                <div className="text-muted-foreground text-[11px]">
                  {m.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            Hủy
          </Button>
          <Button
            size="sm"
            onClick={onStartReview}
            disabled={isStartingReview}
            className="gap-1.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
          >
            {isStartingReview ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Đang khởi tạo...</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                <span>Bắt đầu ôn tập</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
