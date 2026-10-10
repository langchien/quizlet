"use client"

import * as React from "react"
import Image from "next/image"
import { Volume2 } from "lucide-react"
import type { FlashcardItem } from "@/types/flashcard"

export interface FlashcardBackViewProps {
  card: FlashcardItem
  isReverse: boolean
  onSpeak: () => void
}

export function FlashcardBackView({
  card,
  isReverse,
  onSpeak,
}: FlashcardBackViewProps) {
  return (
    <div className="border-border bg-card absolute inset-0 flex rotate-y-180 flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-xl backface-hidden sm:p-8">
      {/* Top Back Info */}
      <div className="flex items-center justify-between">
        <span className="bg-primary/10 text-primary rounded-md px-2.5 py-0.5 text-xs font-bold">
          Đáp án
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSpeak()
          }}
          className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full p-2 transition-colors"
          title="Phát âm tiếng Nhật"
        >
          <Volume2 className="size-4" />
        </button>
      </div>

      {/* Back Content */}
      <div className="my-auto flex flex-col gap-4 text-center">
        {!isReverse ? (
          <>
            <div className="text-foreground text-2xl leading-snug font-extrabold sm:text-3xl">
              {card.definition}
            </div>

            {card.example && (
              <div className="bg-muted/40 mx-auto max-w-lg rounded-2xl p-3 text-left">
                <div className="font-japanese text-foreground text-sm font-semibold">
                  {card.example}
                </div>
                {card.exampleTranslation && (
                  <div className="text-muted-foreground mt-1 text-xs">
                    {card.exampleTranslation}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="font-japanese text-foreground text-4xl font-black">
              {card.term}
            </div>
            <div className="font-japanese text-muted-foreground text-lg">
              {card.reading}
            </div>
          </>
        )}

        {/* Kanji Specific Info if available */}
        {(card.onReading || card.kunReading || card.strokeCount) && (
          <div className="border-border/60 mx-auto flex max-w-sm flex-wrap items-center justify-center gap-3 border-t pt-2 text-[11px]">
            {card.strokeCount && (
              <span className="text-muted-foreground">
                Số nét: <b>{card.strokeCount}</b>
              </span>
            )}
            {card.onReading && (
              <span className="text-muted-foreground">
                Âm On: <b>{card.onReading}</b>
              </span>
            )}
            {card.kunReading && (
              <span className="text-muted-foreground">
                Âm Kun: <b>{card.kunReading}</b>
              </span>
            )}
          </div>
        )}

        {card.imageUrl && (
          <div className="relative mx-auto h-20 w-32 overflow-hidden rounded-xl">
            <Image
              src={card.imageUrl}
              alt={card.term}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Bottom Back Controls */}
      <div className="text-muted-foreground text-center text-xs">
        Đánh giá mức độ ghi nhớ của bạn
      </div>
    </div>
  )
}
