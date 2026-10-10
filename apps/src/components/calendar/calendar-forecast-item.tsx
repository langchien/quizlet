"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { FormattedForecastItem } from "@/hooks/calendar"

interface CalendarForecastItemProps {
  item: FormattedForecastItem
  isSelected: boolean
  onSelect: (date: string) => void
}

export function CalendarForecastItem({
  item,
  isSelected,
  onSelect,
}: CalendarForecastItemProps) {
  const hasDue = item.dueCount > 0

  return (
    <button
      type="button"
      onClick={() => onSelect(item.date)}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border p-3 transition-all",
        isSelected
          ? "border-primary bg-primary/10 shadow-xs"
          : item.isToday
            ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500"
            : "border-border/60 bg-muted/20 hover:border-border"
      )}
    >
      <span className="text-muted-foreground text-[11px] font-semibold">
        {item.dayLabel}
      </span>
      <span className="text-muted-foreground text-[10px]">
        {item.dateShort}
      </span>
      <div className="mt-2 flex items-center justify-center">
        <span
          className={cn(
            "text-base font-black",
            hasDue && item.isToday && "text-emerald-500",
            hasDue && !item.isToday && "text-foreground",
            !hasDue && "text-muted-foreground/60"
          )}
        >
          {item.dueCount}
        </span>
      </div>
      <span className="text-muted-foreground text-[10px]">thẻ</span>
    </button>
  )
}
