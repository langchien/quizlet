"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ListenCardItem, ListenStatus } from "@/types/listen"

interface ListenResultCardProps {
  status: ListenStatus
  currentCard: ListenCardItem
  onNextCard: () => void
}

export function ListenResultCard({
  status,
  currentCard,
  onNextCard,
}: ListenResultCardProps) {
  if (status === "listening") {
    return null
  }

  return (
    <div className="border-border/80 bg-muted/60 animate-in fade-in-0 mx-auto mt-6 flex w-full max-w-md flex-col gap-4 rounded-2xl border p-4 text-center">
      {status === "correct" ? (
        <div className="flex flex-col gap-1 text-emerald-600 dark:text-emerald-400">
          <div className="text-base font-black">
            🎉 Giỏi lắm! Bạn đã nghe chính xác!
          </div>
          <div className="font-japanese text-xl font-bold">
            {currentCard.term} ({currentCard.reading})
          </div>
          <div className="text-muted-foreground text-xs">
            {currentCard.definition}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
            ❌ Đáp án chính xác là:
          </div>
          <div className="bg-background border-border/80 flex flex-col gap-1 rounded-xl border p-3">
            <div className="font-japanese text-foreground text-2xl font-black">
              {currentCard.term}
            </div>
            <div className="font-japanese text-muted-foreground text-sm font-semibold">
              {currentCard.reading}
            </div>
            <div className="text-foreground mt-1 text-xs">
              {currentCard.definition}
            </div>
          </div>
        </div>
      )}

      {currentCard.example && (
        <div className="bg-background/80 font-japanese text-muted-foreground rounded-xl p-2.5 text-xs italic">
          Ví dụ: {currentCard.example}
        </div>
      )}

      <Button
        onClick={onNextCard}
        className="h-11 w-full gap-2 rounded-xl bg-cyan-600 font-bold text-white shadow-xs hover:bg-cyan-700"
      >
        <span>Tiếp tục (Enter)</span>
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
