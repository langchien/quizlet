"use client"

import * as React from "react"
import { useCalendarSRS } from "@/hooks/calendar"
import {
  CalendarHeader,
  CalendarForecastBar,
  CalendarMonthGrid,
  CalendarDayDetailPanel,
} from "@/components/calendar"
import type { MonthDueData, TodayDueData } from "@/types/calendar"

interface CalendarClientProps {
  initialMonthData: MonthDueData
  initialTodayData: TodayDueData
}

export function CalendarClient({
  initialMonthData,
  initialTodayData,
}: CalendarClientProps) {
  const {
    currentYear,
    currentMonth,
    selectedDateStr,
    setSelectedDateStr,
    monthData,
    todayData,
    isPending,
    isSelectedToday,
    selectedDayDueInfo,
    calendarCells,
    handlePrevMonth,
    handleNextMonth,
    handleGoToday,
  } = useCalendarSRS({ initialMonthData, initialTodayData })

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header trang Calendar */}
      <CalendarHeader todayDueCount={todayData?.totalDue} />

      {/* Dự báo ôn tập 7 ngày tới (7-Day Forecast Bar) */}
      <CalendarForecastBar
        forecast={todayData?.forecast}
        selectedDateStr={selectedDateStr}
        onSelectDate={setSelectedDateStr}
      />

      {/* Khu vực Lịch Tháng & Panel Chi tiết ngày */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* CỘT 1 & 2: CALENDAR MONTH GRID */}
        <CalendarMonthGrid
          currentYear={currentYear}
          currentMonth={currentMonth}
          isPending={isPending}
          calendarCells={calendarCells}
          selectedDateStr={selectedDateStr}
          monthData={monthData}
          onSelectDate={setSelectedDateStr}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onGoToday={handleGoToday}
        />

        {/* CỘT 3: PANEL CHI TIẾT NGÀY ĐANG CHỌN */}
        <CalendarDayDetailPanel
          selectedDateStr={selectedDateStr}
          isSelectedToday={isSelectedToday}
          todayData={todayData}
          selectedDayDueInfo={selectedDayDueInfo}
        />
      </div>
    </div>
  )
}
