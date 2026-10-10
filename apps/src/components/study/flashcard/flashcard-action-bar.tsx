"use client"

import * as React from "react"
import { FlashcardNavButtons } from "./flashcard-nav-buttons"
import { FlashcardRatingButtons } from "./flashcard-rating-buttons"
import { FlashcardShortcutsCheatsheet } from "./flashcard-shortcuts-cheatsheet"

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
        <FlashcardNavButtons
          currentIndex={currentIndex}
          totalCards={totalCards}
          onPrev={onPrev}
          onFlip={onFlip}
          onNext={onNext}
        />

        <FlashcardRatingButtons onAnswer={onAnswer} />
      </div>

      {/* Keyboard shortcuts helper cheatsheet */}
      <FlashcardShortcutsCheatsheet />
    </div>
  )
}
