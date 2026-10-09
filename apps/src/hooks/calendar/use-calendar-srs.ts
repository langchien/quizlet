"use client"

import * as React from "react"
import { toast } from "sonner"
import { getCalendarMonthDueAction } from "@/actions/calendar"
import type { MonthDueData, TodayDueData, CalendarCell } from "@/types/calendar"

interface UseCalendarSRSProps {
  initialMonthData: MonthDueData
  initialTodayData: TodayDueData
}

export function useCalendarSRS({
  initialMonthData,
  initialTodayData,
}: UseCalendarSRSProps) {
  const today = React.useMemo(() => new Date(), [])
  const [currentYear, setCurrentYear] = React.useState(
    initialMonthData?.year ?? today.getFullYear()
  )
  const [currentMonth, setCurrentMonth] = React.useState(
    initialMonthData?.month ?? today.getMonth() + 1
  )

  const todayStr = React.useMemo(
    () =>
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
    [today]
  )
  const [selectedDateStr, setSelectedDateStr] = React.useState(todayStr)

  const [monthData, setMonthData] = React.useState(initialMonthData)
  const todayData = initialTodayData
  const [isPending, startTransition] = React.useTransition()

  // Chuyển tháng gọi Server Action
  const loadMonthData = React.useCallback((year: number, month: number) => {
    startTransition(async () => {
      try {
        const res = await getCalendarMonthDueAction(year, month)
        if (res.success) {
          setMonthData(res.data)
        } else {
          toast.error(res.error || "Không thể tải lịch ôn tập.")
        }
      } catch (err) {
        console.error(err)
        toast.error("Lỗi khi tải lịch ôn tập.")
      }
    })
  }, [])

  const handlePrevMonth = React.useCallback(() => {
    let newYear = currentYear
    let newMonth = currentMonth - 1
    if (newMonth < 1) {
      newYear = currentYear - 1
      newMonth = 12
    }
    setCurrentYear(newYear)
    setCurrentMonth(newMonth)
    loadMonthData(newYear, newMonth)
  }, [currentYear, currentMonth, loadMonthData])

  const handleNextMonth = React.useCallback(() => {
    let newYear = currentYear
    let newMonth = currentMonth + 1
    if (newMonth > 12) {
      newYear = currentYear + 1
      newMonth = 1
    }
    setCurrentYear(newYear)
    setCurrentMonth(newMonth)
    loadMonthData(newYear, newMonth)
  }, [currentYear, currentMonth, loadMonthData])

  const handleGoToday = React.useCallback(() => {
    const now = new Date()
    const nowYear = now.getFullYear()
    const nowMonth = now.getMonth() + 1
    setCurrentYear(nowYear)
    setCurrentMonth(nowMonth)
    setSelectedDateStr(todayStr)
    if (nowYear !== currentYear || nowMonth !== currentMonth) {
      loadMonthData(nowYear, nowMonth)
    }
  }, [currentYear, currentMonth, todayStr, loadMonthData])

  // Map ngày sang dictionary để tra cứu nhanh O(1)
  const daysDict = React.useMemo(() => {
    const map: Record<string, NonNullable<MonthDueData>["days"][number]> = {}
    if (monthData?.days && Array.isArray(monthData.days)) {
      for (const d of monthData.days) {
        map[d.date] = d
      }
    }
    return map
  }, [monthData])

  // Tạo danh sách các ô trong bảng lịch
  const calendarCells = React.useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1)
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    const startDayOfWeek = firstDayOfMonth.getDay() // 0: CN -> 6: T7

    const cells: CalendarCell[] = []

    // 1. Ngày của tháng trước
    const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dNum = prevMonthDays - i
      const prevM = currentMonth === 1 ? 12 : currentMonth - 1
      const prevY = currentMonth === 1 ? currentYear - 1 : currentYear
      const dStr = `${prevY}-${String(prevM).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`
      cells.push({
        dateStr: dStr,
        dayNum: dNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        dueCount: 0,
      })
    }

    // 2. Ngày trong tháng hiện tại
    for (let dNum = 1; dNum <= daysInMonth; dNum++) {
      const dStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`
      const dueInfo = daysDict[dStr]
      cells.push({
        dateStr: dStr,
        dayNum: dNum,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        dueCount: dueInfo?.dueCount ?? 0,
      })
    }

    // 3. Ngày của tháng sau
    const totalCells = cells.length > 35 ? 42 : 35
    const remaining = totalCells - cells.length
    for (let dNum = 1; dNum <= remaining; dNum++) {
      const nextM = currentMonth === 12 ? 1 : currentMonth + 1
      const nextY = currentMonth === 12 ? currentYear + 1 : currentYear
      const dStr = `${nextY}-${String(nextM).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`
      cells.push({
        dateStr: dStr,
        dayNum: dNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        dueCount: 0,
      })
    }

    return cells
  }, [currentYear, currentMonth, daysDict, todayStr])

  const isSelectedToday = selectedDateStr === todayStr
  const selectedDayDueInfo = daysDict[selectedDateStr]

  return {
    currentYear,
    currentMonth,
    selectedDateStr,
    setSelectedDateStr,
    monthData,
    todayData,
    isPending,
    todayStr,
    isSelectedToday,
    selectedDayDueInfo,
    calendarCells,
    handlePrevMonth,
    handleNextMonth,
    handleGoToday,
  }
}
