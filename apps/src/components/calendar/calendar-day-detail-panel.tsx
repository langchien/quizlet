"use client"

import * as React from "react"
import { useCalendarDayDetail } from "@/hooks/calendar"
import { CalendarDayHeader } from "./calendar-day-header"
import { CalendarDayStats } from "./calendar-day-stats"
import { CalendarCardList } from "./calendar-card-list"
import { CalendarDayAction } from "./calendar-day-action"
import type { MonthDueData, TodayDueData } from "@/types/calendar"

interface CalendarDayDetailPanelProps {
  selectedDateStr: string
  isSelectedToday: boolean
  todayData: TodayDueData
  selectedDayDueInfo?: NonNullable<MonthDueData>["days"][number]
}

export function CalendarDayDetailPanel({
  selectedDateStr,
  isSelectedToday,
  todayData,
  selectedDayDueInfo,
}: CalendarDayDetailPanelProps) {
  const { totalDue, overdueCount, cards, canStartStudy } = useCalendarDayDetail(
    {
      selectedDateStr,
      isSelectedToday,
      todayData,
      selectedDayDueInfo,
    }
  )

  return (
    <div className="border-border bg-card flex flex-col justify-between rounded-3xl border p-6 shadow-2xs">
      <div className="flex flex-col gap-4">
        {/* Header ngày */}
        <CalendarDayHeader
          selectedDateStr={selectedDateStr}
          isSelectedToday={isSelectedToday}
        />

        {/* Thông số thống kê */}
        <CalendarDayStats totalDue={totalDue} overdueCount={overdueCount} />

        {/* Danh sách thẻ chi tiết */}
        <div className="mt-2 flex flex-col gap-2">
          <span className="text-foreground text-xs font-bold">
            Danh sách thẻ cần ôn:
          </span>
          <CalendarCardList cards={cards} />
        </div>
      </div>

      {/* Action button */}
      <CalendarDayAction canStartStudy={canStartStudy} />
    </div>
  )
}
