"use client"

import * as React from "react"

interface CalendarMonthLegendProps {
  totalDueInMonth?: number
}

export function CalendarMonthLegend({
  totalDueInMonth = 0,
}: CalendarMonthLegendProps) {
  return (
    <div className="border-border/50 text-muted-foreground flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-500" />
          <span>Hôm nay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-500" />
          <span>Có thẻ đến hạn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="bg-primary size-2.5 rounded-full" />
          <span>Đang chọn</span>
        </div>
      </div>

      <span className="text-foreground font-semibold">
        Tháng này: {totalDueInMonth} thẻ cần ôn
      </span>
    </div>
  )
}
