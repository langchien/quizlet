"use client"

import * as React from "react"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

export interface StudySummaryMetricCardProps {
  accuracy: number
  correctCards: number
  incorrectCards: number
  durationSeconds: number
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  if (m === 0) return `${s} giây`
  return `${m}p ${s}s`
}

export function StudySummaryMetricCard({
  accuracy,
  correctCards,
  incorrectCards,
  durationSeconds,
}: StudySummaryMetricCardProps) {
  return (
    <div className="border-border/60 from-muted/30 to-background my-6 rounded-2xl border bg-gradient-to-b p-6">
      <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        Tỷ lệ ghi nhớ
      </div>
      <div className="text-foreground mt-1 text-5xl font-black sm:text-6xl">
        {accuracy}
        <span className="text-primary text-3xl sm:text-4xl">%</span>
      </div>

      <div className="border-border/60 mt-4 grid grid-cols-3 gap-2 border-t pt-4">
        <div className="text-center">
          <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Đúng</span>
          </div>
          <div className="mt-0.5 text-lg font-bold text-emerald-500">
            {correctCards}
          </div>
        </div>

        <div className="text-center">
          <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
            <XCircle className="size-3.5 text-rose-500" />
            <span>Sai</span>
          </div>
          <div className="mt-0.5 text-lg font-bold text-rose-500">
            {incorrectCards}
          </div>
        </div>

        <div className="text-center">
          <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
            <Clock className="size-3.5 text-blue-500" />
            <span>Thời gian</span>
          </div>
          <div className="text-foreground mt-0.5 text-lg font-bold">
            {formatDuration(durationSeconds)}
          </div>
        </div>
      </div>
    </div>
  )
}
