"use client"

import * as React from "react"
import type { CardWithSet } from "@/hooks/tags"
import { TagDetailCardItem } from "./tag-detail-card-item"

interface TagDetailCardListProps {
  tagName: string
  cards: CardWithSet[]
  onSpeak: (text: string) => void
}

export function TagDetailCardList({
  tagName,
  cards,
  onSpeak,
}: TagDetailCardListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-foreground text-base font-bold">
        Danh sách thẻ học gắn nhãn &quot;{tagName}&quot;
      </h2>

      {cards.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-2xl border border-dashed py-12 text-center text-xs">
          Chưa có thẻ nào được gắn nhãn này. Hãy mở bộ thẻ và gán nhãn vào thẻ!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <TagDetailCardItem key={card.id} card={card} onSpeak={onSpeak} />
          ))}
        </div>
      )}
    </div>
  )
}
