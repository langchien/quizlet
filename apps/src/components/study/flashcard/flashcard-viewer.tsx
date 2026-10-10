"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { FlashcardItem } from "@/types/flashcard"
import { FlashcardFrontView } from "./flashcard-front-view"
import { FlashcardBackView } from "./flashcard-back-view"

interface FlashcardViewerProps {
  card: FlashcardItem
  isFlipped: boolean
  isReverse: boolean
  onFlip: () => void
  onSpeak: () => void
}

export function FlashcardViewer({
  card,
  isFlipped,
  isReverse,
  onFlip,
  onSpeak,
}: FlashcardViewerProps) {
  return (
    <div className="perspective-1000 relative mx-auto h-[380px] w-full max-w-2xl sm:h-[420px]">
      <div
        onClick={onFlip}
        className={cn(
          "transform-style-3d relative h-full w-full cursor-pointer rounded-3xl transition-transform duration-500 select-none",
          isFlipped && "rotate-y-180"
        )}
      >
        <FlashcardFrontView
          card={card}
          isReverse={isReverse}
          onSpeak={onSpeak}
        />

        <FlashcardBackView
          card={card}
          isReverse={isReverse}
          onSpeak={onSpeak}
        />
      </div>
    </div>
  )
}
