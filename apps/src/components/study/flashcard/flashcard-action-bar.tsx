"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, RotateCcw, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FlashcardActionBarProps {
  currentIndex: number
  totalCards: number
  onPrev: () => void
  onFlip: () => void
  onNext: () => void
  onAnswer: (isCorrect: boolean) => void
}

export function FlashcardActionBar({
  currentIndex,
  totalCards,
  onPrev,
  onFlip,
  onNext,
  onAnswer,
}: FlashcardActionBarProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Main Bottom Actions Bar */}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="gap-1 rounded-xl"
            title="Thẻ trước (Phím ←)"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Trước</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onFlip}
            className="gap-1.5 rounded-xl font-bold"
          >
            <RotateCcw className="size-3.5" />
            <span>Lật thẻ</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={currentIndex + 1 >= totalCards}
            className="gap-1 rounded-xl"
            title="Thẻ sau (Phím →)"
          >
            <span className="hidden sm:inline">Sau</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* Rating buttons */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => onAnswer(false)}
            className="gap-1.5 rounded-xl border-rose-500/30 font-semibold text-rose-600 shadow-2xs hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-400"
            title="Chưa nhớ (Phím 1)"
          >
            <X className="size-4" />
            <span>Chưa biết (1)</span>
          </Button>

          <Button
            onClick={() => onAnswer(true)}
            className="gap-1.5 rounded-xl bg-emerald-600 font-semibold text-white shadow-xs hover:bg-emerald-700"
            title="Đã nhớ (Phím 2)"
          >
            <Check className="size-4" />
            <span>Đã biết (2)</span>
          </Button>
        </div>
      </div>

      {/* Keyboard shortcuts helper cheatsheet */}
      <div className="border-border/40 text-muted-foreground mx-auto flex w-full max-w-2xl flex-wrap items-center justify-center gap-4 border-t pt-4 text-[11px]">
        <span>
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            Space
          </kbd>{" "}
          Lật thẻ
        </span>
        <span>
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            ← / →
          </kbd>{" "}
          Chuyển thẻ
        </span>
        <span>
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            1
          </kbd>{" "}
          Chưa biết
        </span>
        <span>
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            2
          </kbd>{" "}
          Đã biết
        </span>
        <span>
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            A
          </kbd>{" "}
          Phát âm
        </span>
      </div>
    </div>
  )
}
