"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, BrainCircuit } from "lucide-react"

interface LearnHeaderProps {
  setId: string
  learnedCount: number
  totalCards: number
}

export function LearnHeader({
  setId,
  learnedCount,
  totalCards,
}: LearnHeaderProps) {
  const progressPct =
    totalCards > 0 ? Math.round((learnedCount / totalCards) * 100) : 0

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

      {/* Tiến độ học */}
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground text-xs font-bold">
          <span className="font-black text-emerald-500">{learnedCount}</span> /{" "}
          {totalCards} đã thuộc
        </div>
        <div className="bg-muted h-2.5 w-32 overflow-hidden rounded-full sm:w-48">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Mode label */}
      <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <BrainCircuit className="size-3.5" />
        <span className="hidden sm:inline">Học thích ứng</span>
      </div>
    </div>
  )
}
