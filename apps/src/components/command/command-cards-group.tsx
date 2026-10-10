"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { SearchResults } from "@/types/command-palette"

interface CommandCardItemProps {
  card: SearchResults["cards"][number]
  onSelect: (url: string) => void
}

function CommandCardItem({ card, onSelect }: CommandCardItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(`/sets/${card.studySetId}`)}
      className="group hover:bg-muted flex w-full items-center justify-between rounded-xl p-2 text-left transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-japanese text-foreground group-hover:text-primary text-sm font-bold transition-colors">
            {card.term}
          </span>
          {card.reading && (
            <span className="text-muted-foreground text-xs">
              【{card.reading}】
            </span>
          )}
        </div>
        <p className="text-foreground/80 mt-0.5 truncate text-xs">
          {card.definition}
        </p>
      </div>
      <Badge
        variant="secondary"
        className="bg-primary/10 text-primary ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px]"
      >
        {card.studySetName}
      </Badge>
    </button>
  )
}

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
      <div className="mt-1 flex flex-col gap-1">
        {cards.map((card) => (
          <CommandCardItem key={card.id} card={card} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
