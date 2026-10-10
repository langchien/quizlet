"use client"

import * as React from "react"
import { Volume2, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { FlashcardItem } from "@/types/flashcard"

export interface FlashcardFrontViewProps {
  card: FlashcardItem
  isReverse: boolean
  onSpeak: () => void
}

export function FlashcardFrontView({
  card,
  isReverse,
  onSpeak,
}: FlashcardFrontViewProps) {
  return (
    <div className="border-border bg-card absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-xl backface-hidden sm:p-8">
      {/* Top Front Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {card.jlptLevel && (
            <Badge variant="outline" className="text-xs font-bold">
              {card.jlptLevel}
            </Badge>
          )}
          {card.wordType && (
            <span className="text-muted-foreground text-xs">
              {card.wordType}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSpeak()
          }}
          className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full p-2.5 transition-colors"
          title="Phát âm tiếng Nhật (Phím A)"
        >
          <Volume2 className="size-4" />
        </button>
      </div>

      {/* Front Content */}
      <div className="my-auto text-center">
        {!isReverse ? (
          <>
            <h2 className="font-japanese text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl">
              {card.term}
            </h2>
            <p className="font-japanese text-muted-foreground mt-3 text-lg font-medium sm:text-xl">
              {card.reading}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-foreground text-2xl leading-relaxed font-bold sm:text-3xl">
              {card.definition}
            </h2>
            {card.exampleTranslation && (
              <p className="text-muted-foreground mt-3 text-sm italic">
                &quot;{card.exampleTranslation}&quot;
              </p>
            )}
          </>
        )}
      </div>

      {/* Bottom Front Hint */}
      <div className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
        <Sparkles className="size-3.5 text-amber-500" />
        <span>Nhấn vào thẻ hoặc phím Cách (Space) để lật</span>
      </div>
    </div>
  )
}
