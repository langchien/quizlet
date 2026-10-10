"use client"

import * as React from "react"

interface CalendarDayStatsProps {
  totalDue: number
  overdueCount: number
}

export function CalendarDayStats({
  totalDue,
  overdueCount,
}: CalendarDayStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-muted/30 border-border/50 rounded-2xl border p-3">
        <span className="text-muted-foreground text-[11px] font-medium">
          Tổng thẻ đến hạn
        </span>
        <div className="text-foreground mt-1 text-xl font-black">
          {totalDue}
        </div>
      </div>

      <div className="bg-muted/30 border-border/50 rounded-2xl border p-3">
        <span className="text-muted-foreground text-[11px] font-medium">
          Quá hạn ôn
        </span>
        <div className="mt-1 text-xl font-black text-rose-500">
          {overdueCount}
        </div>
      </div>
    </div>
  )
}
