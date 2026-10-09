"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WriteCardItem, WriteStatus } from "@/types/write"

interface WriteFeedbackViewProps {
  status: WriteStatus
  currentCard: WriteCardItem
  onOverrideCorrect: () => void
  onNextCard: () => void
}

export function WriteFeedbackView({
  status,
  currentCard,
  onOverrideCorrect,
  onNextCard,
}: WriteFeedbackViewProps) {
  if (status === "typing") {
    return null
  }

  return (
    <div className="border-border/80 bg-muted/60 animate-in fade-in-0 mx-auto mt-6 flex w-full max-w-md flex-col gap-4 rounded-2xl border p-4 text-center">
      {status === "correct" ? (
        <div className="flex flex-col gap-1 text-emerald-600 dark:text-emerald-400">
          <div className="text-base font-extrabold">
            🎉 Chính xác! Làm rất tốt!
          </div>
          <div className="font-japanese text-sm font-semibold">
            {currentCard.term} ({currentCard.reading})
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
            ❌ Đáp án chính xác là:
          </div>
          <div className="bg-background border-border/80 flex flex-col gap-1 rounded-xl border p-3">
            <div className="font-japanese text-foreground text-2xl font-black">
              {currentCard.term}
            </div>
            <div className="font-japanese text-muted-foreground text-sm font-medium">
              {currentCard.reading}
            </div>
            <div className="text-foreground mt-1 text-xs">
              {currentCard.definition}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOverrideCorrect}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Đáp án của tôi đúng
            </Button>
          </div>
        </div>
      )}

      <Button
        onClick={onNextCard}
        className="mt-1 h-11 w-full gap-2 rounded-xl font-bold shadow-xs"
      >
        <span>Tiếp tục (Enter)</span>
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
