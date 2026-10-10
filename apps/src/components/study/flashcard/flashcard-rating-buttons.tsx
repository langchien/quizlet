"use client"

import * as React from "react"
import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface FlashcardRatingButtonsProps {
  onAnswer: (isCorrect: boolean) => void
}

export function FlashcardRatingButtons({
  onAnswer,
}: FlashcardRatingButtonsProps) {
  return (
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
  )
}
