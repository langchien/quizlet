"use client"

import * as React from "react"
import { Volume2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { WriteCardItem } from "@/types/write"

interface WritePromptCardProps {
  currentCard: WriteCardItem
  onSpeak: (text: string) => void
}

export function WritePromptCard({
  currentCard,
  onSpeak,
}: WritePromptCardProps) {
  return (
    <div>
      {/* Card Header Info */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-[11px] font-bold">
            Nhìn định nghĩa gõ tiếng Nhật
          </span>

          {currentCard.jlptLevel && (
            <Badge variant="outline" className="text-[10px]">
              {currentCard.jlptLevel}
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSpeak(currentCard.term)}
          className="text-primary hover:bg-primary/10 rounded-full p-2 transition-colors"
          title="Phát âm tiếng Nhật"
        >
          <Volume2 className="size-4" />
        </button>
      </div>

      {/* Prompt Section */}
      <div className="my-6 text-center">
        <div className="text-muted-foreground mb-1 text-xs font-medium">
          Nghĩa tiếng Việt (Hãy gõ từ tiếng Nhật tương ứng):
        </div>
        <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
          {currentCard.definition}
        </h2>

        {/* Example Context if available */}
        {currentCard.example && (
          <div className="bg-muted/40 mx-auto mt-4 max-w-lg rounded-2xl p-3 text-left">
            <div className="font-japanese text-foreground text-xs font-medium">
              {currentCard.example}
            </div>
            {currentCard.exampleTranslation && (
              <div className="text-muted-foreground mt-0.5 text-[11px]">
                {currentCard.exampleTranslation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
