"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { useCalendarForecast } from "@/hooks/calendar"
import { CalendarForecastItem } from "./calendar-forecast-item"

interface CalendarForecastBarProps {
  forecast?: Array<{ date: string; dueCount: number }>
  selectedDateStr: string
  onSelectDate: (date: string) => void
}

export function CalendarForecastBar({
  forecast,
  selectedDateStr,
  onSelectDate,
}: CalendarForecastBarProps) {
  const { totalForecastCount, formattedItems, hasForecast } =
    useCalendarForecast({ forecast })

  if (!hasForecast) {
    return null
  }

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-3xl border p-5 shadow-2xs">
      <div className="flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
          <Clock className="text-primary size-3.5" />
          <span>Dự báo lịch ôn 7 ngày tới</span>
        </h3>
        <span className="text-muted-foreground text-[11px]">
          Tổng cộng {totalForecastCount} lượt ôn
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {formattedItems.map((item) => (
          <CalendarForecastItem
            key={item.date}
            item={item}
            isSelected={selectedDateStr === item.date}
            onSelect={onSelectDate}
          />
        ))}
      </div>
    </div>
  )
}
