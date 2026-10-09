"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, Headphones } from "lucide-react"

interface ListenHeaderProps {
  setId: string
  currentIndex: number
  totalCards: number
}

export function ListenHeader({
  setId,
  currentIndex,
  totalCards,
}: ListenHeaderProps) {
  const progressPct =
    totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0

  return (
    <div className="flex items-center justify-between">
      {/* Nút thoát */}
      <Link
        href={`/sets/${setId}`}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-semibold transition-colors"
      >
        <ChevronLeft className="size-4" />
        <span>Thoát</span>
      </Link>

      {/* Tiến độ luyện nghe */}
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground text-xs font-bold">
          <span className="font-black text-cyan-500">{currentIndex + 1}</span> /{" "}
          {totalCards}
        </div>
        <div className="bg-muted h-2.5 w-32 overflow-hidden rounded-full sm:w-48">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Mode label */}
      <div className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
        <Headphones className="size-3.5" />
        <span className="hidden sm:inline">Luyện nghe</span>
      </div>
    </div>
  )
}
