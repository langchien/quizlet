"use client"

import * as React from "react"
import Link from "next/link"
import { Volume2, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CardWithSet } from "@/hooks/tags"

interface TagDetailCardItemProps {
  card: CardWithSet
  onSpeak: (text: string) => void
}

export function TagDetailCardItem({ card, onSpeak }: TagDetailCardItemProps) {
  return (
    <div className="border-border bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-4 shadow-2xs transition-colors">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-foreground text-lg font-bold">
              {card.term}
            </span>
            {card.reading && card.reading !== card.term && (
              <span className="text-muted-foreground text-xs">
                [{card.reading}]
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onSpeak(card.reading || card.term)}
            className="text-muted-foreground hover:text-foreground rounded-lg"
            title="Phát âm tiếng Nhật"
          >
            <Volume2 className="size-4" />
            <span className="sr-only">Phát âm</span>
          </Button>
        </div>

        <p className="text-foreground/90 mt-2 text-sm">{card.definition}</p>

        {card.example && (
          <div className="bg-muted/40 mt-3 rounded-xl p-2.5 text-xs">
            <div className="text-foreground font-medium">{card.example}</div>
            {card.exampleTranslation && (
              <div className="text-muted-foreground mt-0.5">
                {card.exampleTranslation}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-border/40 mt-4 flex items-center justify-between border-t pt-3">
        <Link
          href={`/sets/${card.studySetId}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
        >
          <BookOpen className="size-3.5" />
          <span className="max-w-[180px] truncate">{card.studySet.name}</span>
        </Link>

        <div className="flex items-center gap-1.5">
          {card.jlptLevel && (
            <Badge variant="outline" className="text-[10px]">
              {card.jlptLevel}
            </Badge>
          )}
          {card.wordType && (
            <Badge variant="secondary" className="text-[10px]">
              {card.wordType}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
