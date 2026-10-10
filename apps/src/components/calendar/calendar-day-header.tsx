"use client"

import * as React from "react"
import { BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CalendarDayHeaderProps {
  selectedDateStr: string
  isSelectedToday: boolean
}

export function CalendarDayHeader({
  selectedDateStr,
  isSelectedToday,
}: CalendarDayHeaderProps) {
  return (
    <div className="border-border/50 flex items-center justify-between border-b pb-3">
      <div>
        <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
          <BookOpen className="text-primary size-4" />
          <span>Chi tiết ngày ôn tập</span>
        </h3>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Ngày {selectedDateStr} {isSelectedToday && "(Hôm nay)"}
        </p>
      </div>

      {isSelectedToday && (
        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold text-emerald-500">
          Hôm nay
        </Badge>
      )}
    </div>
  )
}
