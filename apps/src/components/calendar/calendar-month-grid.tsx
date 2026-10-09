"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  MONTH_NAMES,
  DAY_LABELS,
  type CalendarCell,
  type MonthDueData,
} from "@/types/calendar"

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

      {/* Grid Lịch */}
      <div
        className={`grid grid-cols-7 gap-1.5 text-center ${
          isPending
            ? "pointer-events-none opacity-50 transition-opacity"
            : "transition-opacity"
        }`}
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
        {calendarCells.map((cell, idx) => {
          const isSelected = cell.dateStr === selectedDateStr
          const hasDue = cell.dueCount > 0

          let badgeStyle = "bg-muted/40 text-muted-foreground"
          if (cell.isToday && hasDue) {
            badgeStyle = "bg-emerald-500 text-white font-bold animate-pulse"
          } else if (hasDue) {
            badgeStyle =
              "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold"
          }

          return (
            <button
              key={`${cell.dateStr}-${idx}`}
              type="button"
              onClick={() => {
                if (cell.isCurrentMonth) {
                  onSelectDate(cell.dateStr)
                }
              }}
              className={`relative flex min-h-[72px] flex-col items-center justify-between rounded-2xl border p-2 text-left transition-all ${
                !cell.isCurrentMonth
                  ? "cursor-default border-transparent bg-transparent opacity-30"
                  : isSelected
                    ? "border-primary bg-primary/10 ring-primary shadow-xs ring-1"
                    : cell.isToday
                      ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500"
                      : "border-border/50 bg-card hover:bg-muted/30"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`text-xs font-bold ${
                    cell.isToday
                      ? "text-emerald-500 underline decoration-2 underline-offset-4"
                      : cell.isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {cell.dayNum}
                </span>

                {cell.isToday && (
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                )}
              </div>

              {cell.isCurrentMonth && hasDue && (
                <div
                  className={`mt-1.5 inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[10px] ${badgeStyle}`}
                >
                  {cell.dueCount} thẻ
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Chú giải trạng thái */}
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

        {monthData && (
          <span className="text-foreground font-semibold">
            Tháng này: {monthData.totalDueInMonth ?? 0} thẻ cần ôn
          </span>
        )}
      </div>
    </div>
  )
}
