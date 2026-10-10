"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { CalendarCell } from "@/types/calendar"

interface CalendarMonthCellProps {
  cell: CalendarCell
  isSelected: boolean
  onSelect: (date: string) => void
}

export function CalendarMonthCell({
  cell,
  isSelected,
  onSelect,
}: CalendarMonthCellProps) {
  const hasDue = cell.dueCount > 0

  return (
    <button
      type="button"
      onClick={() => {
        if (cell.isCurrentMonth) {
          onSelect(cell.dateStr)
        }
      }}
      className={cn(
        "relative flex min-h-[72px] flex-col items-center justify-between rounded-2xl border p-2 text-left transition-all",
        !cell.isCurrentMonth &&
          "cursor-default border-transparent bg-transparent opacity-30",
        cell.isCurrentMonth &&
          (isSelected
            ? "border-primary bg-primary/10 ring-primary shadow-xs ring-1"
            : cell.isToday
              ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500"
              : "border-border/50 bg-card hover:bg-muted/30")
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span
          className={cn(
            "text-xs font-bold",
            cell.isToday &&
              "text-emerald-500 underline decoration-2 underline-offset-4",
            !cell.isToday && cell.isCurrentMonth && "text-foreground",
            !cell.isToday && !cell.isCurrentMonth && "text-muted-foreground"
          )}
        >
          {cell.dayNum}
        </span>

        {cell.isToday && (
          <span className="size-1.5 rounded-full bg-emerald-500" />
        )}
      </div>

      {cell.isCurrentMonth && hasDue && (
        <div
          className={cn(
            "mt-1.5 inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[10px] font-bold",
            cell.isToday
              ? "animate-pulse bg-emerald-500 text-white"
              : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
          )}
        >
          {cell.dueCount} thẻ
        </div>
      )}
    </button>
  )
}
