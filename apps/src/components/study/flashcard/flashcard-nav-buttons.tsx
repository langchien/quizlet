"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface FlashcardNavButtonsProps {
  currentIndex: number
  totalCards: number
  onPrev: () => void
  onFlip: () => void
  onNext: () => void
}

export function FlashcardNavButtons({
  currentIndex,
  totalCards,
  onPrev,
  onFlip,
  onNext,
}: FlashcardNavButtonsProps) {
  return (
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
  )
}
