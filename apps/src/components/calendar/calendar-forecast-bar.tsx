"use client"

import * as React from "react"
import { Clock } from "lucide-react"

interface CalendarForecastBarProps {
  forecast?: Array<{ date: string; dueCount: number }>
  selectedDateStr: string
  onSelectDate: (date: string) => void
}

const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

export function CalendarForecastBar({
  forecast,
  selectedDateStr,
  onSelectDate,
}: CalendarForecastBarProps) {
  if (!forecast || forecast.length === 0) {
    return null
  }

  const totalForecastCount = forecast.reduce((acc, f) => acc + f.dueCount, 0)

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
        {forecast.map((item, idx) => {
          const isTodayItem = idx === 0
          const d = new Date(item.date)
          const dayLabel = DAY_NAMES[d.getDay()]

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => onSelectDate(item.date)}
              className={`flex flex-col items-center justify-center rounded-2xl border p-3 transition-all ${
                selectedDateStr === item.date
                  ? "border-primary bg-primary/10 shadow-xs"
                  : isTodayItem
                    ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500"
                    : "border-border/60 bg-muted/20 hover:border-border"
              }`}
            >
              <span className="text-muted-foreground text-[11px] font-semibold">
                {dayLabel}
              </span>
              <span className="text-muted-foreground text-[10px]">
                {item.date.slice(5)}
              </span>
              <div className="mt-2 flex items-center justify-center">
                <span
                  className={`text-base font-black ${
                    item.dueCount > 0
                      ? isTodayItem
                        ? "font-extrabold text-emerald-500"
                        : "text-foreground"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {item.dueCount}
                </span>
              </div>
              <span className="text-muted-foreground text-[10px]">thẻ</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
