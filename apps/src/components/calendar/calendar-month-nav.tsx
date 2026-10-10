"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MONTH_NAMES } from "@/types/calendar"

interface CalendarMonthNavProps {
  currentYear: number
  currentMonth: number
  isPending: boolean
  onPrevMonth: () => void
  onNextMonth: () => void
  onGoToday: () => void
}

export function CalendarMonthNav({
  currentYear,
  currentMonth,
  isPending,
  onPrevMonth,
  onNextMonth,
  onGoToday,
}: CalendarMonthNavProps) {
  return (
    <div className="border-border/50 flex items-center justify-between border-b pb-2">
      <div className="flex items-center gap-3">
        <h2 className="text-foreground text-lg font-black tracking-tight">
          {MONTH_NAMES[currentMonth - 1]}, {currentYear}
        </h2>

        <Button
          variant="outline"
          size="sm"
          onClick={onGoToday}
          className="h-7 rounded-xl px-2.5 text-[11px]"
        >
          Hôm nay
        </Button>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevMonth}
          disabled={isPending}
          className="size-8 rounded-xl"
          aria-label="Tháng trước"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextMonth}
          disabled={isPending}
          className="size-8 rounded-xl"
          aria-label="Tháng sau"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
