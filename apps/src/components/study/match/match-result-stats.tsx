"use client"

import * as React from "react"

export interface MatchResultStatsProps {
  secondsFormatted: string
  totalPairs: number
  penaltyCount: number
  personalBestSecs: number | null
}

export function MatchResultStats({
  secondsFormatted,
  totalPairs,
  penaltyCount,
  personalBestSecs,
}: MatchResultStatsProps) {
  return (
    <div className="border-border/60 from-muted/30 to-background my-6 rounded-2xl border bg-gradient-to-b p-6">
      <div className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
        Thời gian hoàn thành
      </div>
      <div className="text-foreground mt-1 text-5xl font-black sm:text-6xl">
        {secondsFormatted}
        <span className="text-3xl text-rose-500 sm:text-4xl">s</span>
      </div>

      <div className="border-border/60 mt-6 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-3">
        <div className="text-center">
          <div className="text-muted-foreground text-xs font-medium">
            Số cặp đã ghép
          </div>
          <div className="text-foreground mt-0.5 text-lg font-bold">
            {totalPairs} cặp
          </div>
        </div>

        <div className="text-center">
          <div className="text-muted-foreground text-xs font-medium">
            Số lần phạt (+1s)
          </div>
          <div className="mt-0.5 text-lg font-bold text-rose-500">
            {penaltyCount} lần
          </div>
        </div>

        <div className="col-span-2 text-center sm:col-span-1">
          <div className="text-muted-foreground text-xs font-medium">
            Kỷ lục cá nhân (PB)
          </div>
          <div className="text-foreground mt-0.5 text-lg font-bold">
            {personalBestSecs !== null ? `${personalBestSecs}s` : "--"}
          </div>
        </div>
      </div>
    </div>
  )
}
