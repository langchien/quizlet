"use client"

import * as React from "react"
import {
  DAY_LABELS,
  type CalendarCell,
  type MonthDueData,
} from "@/types/calendar"
import { CalendarMonthNav } from "./calendar-month-nav"
import { CalendarMonthCell } from "./calendar-month-cell"
import { CalendarMonthLegend } from "./calendar-month-legend"
import { cn } from "@/lib/utils"

interface CalendarMonthGridProps {
  currentYear: number
  currentMonth: number
  isPending: boolean
  calendarCells: CalendarCell[]
  selectedDateStr: string
  monthData: MonthDueData
  onSelectDate: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onGoToday: () => void
}

export function CalendarMonthGrid({
  currentYear,
  currentMonth,
  isPending,
  calendarCells,
  selectedDateStr,
  monthData,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToday,
}: CalendarMonthGridProps) {
  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-3xl border p-6 shadow-2xs lg:col-span-2">
      {/* Thanh chuyển tháng */}
      <CalendarMonthNav
        currentYear={currentYear}
        currentMonth={currentMonth}
        isPending={isPending}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onGoToday={onGoToday}
      />

      {/* Grid Lịch */}
      <div
        className={cn(
          "grid grid-cols-7 gap-1.5 text-center transition-opacity",
          isPending && "pointer-events-none opacity-50"
        )}
      >
        {/* Hàng Header thứ */}
        {DAY_LABELS.map((day) => (
          <div
            key={day}
            className="text-muted-foreground py-1 text-xs font-bold uppercase"
          >
            {day}
          </div>
        ))}

        {/* Các ô ngày */}
        {calendarCells.map((cell, idx) => (
          <CalendarMonthCell
            key={`${cell.dateStr}-${idx}`}
            cell={cell}
            isSelected={cell.dateStr === selectedDateStr}
            onSelect={onSelectDate}
          />
        ))}
      </div>

      {/* Chú giải trạng thái */}
      <CalendarMonthLegend totalDueInMonth={monthData?.totalDueInMonth ?? 0} />
    </div>
  )
}
