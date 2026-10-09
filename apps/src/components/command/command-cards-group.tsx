"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import type { SearchResults } from "@/types/command-palette"

interface CommandCardsGroupProps {
  cards: SearchResults["cards"]
  onSelect: (url: string) => void
}

export function CommandCardsGroup({ cards, onSelect }: CommandCardsGroupProps) {
  if (cards.length === 0) return null

  return (
    <div>
      <div className="text-muted-foreground flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
        <Sparkles className="size-3.5 text-amber-500" />
        <span>Từ vựng & Thẻ học ({cards.length})</span>
      </div>
      <div className="mt-1 space-y-1">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(`/sets/${card.studySetId}`)}
            className="hover:bg-muted group flex w-full items-center justify-between rounded-xl p-2 text-left transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-foreground group-hover:text-primary font-japanese text-sm font-bold transition-colors">
                  {card.term}
                </span>
                {card.reading && (
                  <span className="text-muted-foreground text-xs">
                    【{card.reading}】
                  </span>
                )}
              </div>
              <div className="text-foreground/80 mt-0.5 truncate text-xs">
                {card.definition}
              </div>
            </div>
            <div className="bg-primary/10 text-primary ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px]">
              {card.studySetName}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
