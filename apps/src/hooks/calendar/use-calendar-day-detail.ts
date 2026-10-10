"use client"

import * as React from "react"
import type { MonthDueData, TodayDueData } from "@/types/calendar"

export interface UseCalendarDayDetailProps {
  selectedDateStr: string
  isSelectedToday: boolean
  todayData: TodayDueData
  selectedDayDueInfo?: NonNullable<MonthDueData>["days"][number]
}

/**
 * Hook xử lý logic tính toán dữ liệu thống kê và danh sách thẻ cho Panel chi tiết ngày
 */
export function useCalendarDayDetail({
  selectedDateStr,
  isSelectedToday,
  todayData,
  selectedDayDueInfo,
}: UseCalendarDayDetailProps) {
  const totalDue = React.useMemo(() => {
    return isSelectedToday
      ? (todayData?.totalDue ?? 0)
      : (selectedDayDueInfo?.dueCount ?? 0)
  }, [isSelectedToday, todayData, selectedDayDueInfo])

  const overdueCount = React.useMemo(() => {
    return isSelectedToday ? (todayData?.overdueCount ?? 0) : 0
  }, [isSelectedToday, todayData])

  const cards = React.useMemo(() => {
    return isSelectedToday && todayData?.cards ? todayData.cards : []
  }, [isSelectedToday, todayData])

  const hasCards = cards.length > 0
  const canStartStudy = isSelectedToday && (todayData?.totalDue ?? 0) > 0

  return {
    selectedDateStr,
    isSelectedToday,
    totalDue,
    overdueCount,
    cards,
    hasCards,
    canStartStudy,
  }
}
