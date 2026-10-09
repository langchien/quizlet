"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, Timer, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MatchHeaderProps {
  setId: string
  setName?: string
  secondsFormatted: string
  totalPairs: number
  matchedPairsCount: number
  onRestart: () => void
}

export function MatchHeader({
  setId,
  setName,
  secondsFormatted,
  totalPairs,
  matchedPairsCount,
  onRestart,
}: MatchHeaderProps) {
  const remainingPairs = Math.max(0, totalPairs - matchedPairsCount)

  return (
    <div className="border-border bg-card/80 flex items-center justify-between rounded-2xl border p-3.5 shadow-sm backdrop-blur-md">
      {/* Về bộ thẻ & Tên bộ thẻ */}
      <div className="flex items-center gap-2">
        <Link
          href={`/sets/${setId}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ChevronLeft className="size-4" />
          <span>Về bộ thẻ</span>
        </Link>
        {setName && (
          <Badge
            variant="outline"
            className="hidden text-[10px] sm:inline-flex"
          >
            {setName}
          </Badge>
        )}
      </div>

      {/* Stopwatch & Pairs Progress */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3.5 py-1 text-xs font-black text-rose-600 dark:text-rose-400">
          <Timer className="size-4" />
          <span className="font-mono text-sm">{secondsFormatted}s</span>
        </div>

        <div className="text-muted-foreground hidden text-xs font-bold sm:inline-block">
          Còn lại:{" "}
          <span className="text-foreground font-black">{remainingPairs}</span> /{" "}
          {totalPairs} cặp
        </div>
      </div>

      {/* Nút Chơi lại ván mới */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRestart}
        className="gap-1.5 rounded-xl text-xs font-bold"
      >
        <RotateCcw className="size-3.5" />
        <span className="hidden sm:inline">Chơi lại</span>
      </Button>
    </div>
  )
}
