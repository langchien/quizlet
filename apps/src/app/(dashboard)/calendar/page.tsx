"use client"

import * as React from "react"
import Link from "next/link"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type {
  CalendarDueResponse,
  CalendarTodayResponse,
} from "@/schemas/calendar"

const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
]

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

const SRS_STATUS_BADGES: Record<string, { label: string; className: string }> =
  {
    New: {
      label: "Mới",
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    Learning: {
      label: "Đang học",
      className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    Review: {
      label: "Ôn tập",
      className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    Mastered: {
      label: "Thuần thục",
      className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
  }

export default function CalendarPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth() + 1) // 1-12

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  const [selectedDateStr, setSelectedDateStr] = React.useState(todayStr)

  const [monthData, setMonthData] = React.useState<CalendarDueResponse | null>(
    null
  )
  const [todayData, setTodayData] =
    React.useState<CalendarTodayResponse | null>(null)
  const [loading, setLoading] = React.useState(true)

  // 1. Tải dữ liệu lịch tháng
  const fetchMonthDueData = React.useCallback(
    async (year: number, month: number) => {
      try {
        setLoading(true)
        const res = await fetch(`/api/calendar/due?year=${year}&month=${month}`)
        if (res.ok) {
          setMonthData(await res.json())
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu lịch tháng:", err)
        toast.error("Không thể tải lịch ôn tập.")
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // 2. Tải danh sách thẻ hôm nay và dự báo 7 ngày
  const fetchTodayData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/calendar/today")
      if (res.ok) {
        setTodayData(await res.json())
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách thẻ hôm nay:", err)
    }
  }, [])

  React.useEffect(() => {
    fetchMonthDueData(currentYear, currentMonth)
    fetchTodayData()
  }, [fetchMonthDueData, fetchTodayData, currentYear, currentMonth])

  // Điều hướng tháng
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1)
      setCurrentMonth(12)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1)
      setCurrentMonth(1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleGoToday = () => {
    const now = new Date()
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth() + 1)
    setSelectedDateStr(todayStr)
  }

  // Tạo danh sách các ô trong bảng lịch (bao gồm các ngày đệm)
  const calendarCells = React.useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1)
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    const startDayOfWeek = firstDayOfMonth.getDay() // 0: CN -> 6: T7

    const cells: {
      dateStr: string
      dayNum: number
      isCurrentMonth: boolean
      isToday: boolean
      dueCount: number
    }[] = []

    // 1. Ngày của tháng trước (Padding đầu)
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
      const dueInfo = monthData?.days?.[dStr]
      cells.push({
        dateStr: dStr,
        dayNum: dNum,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        dueCount: dueInfo?.dueCount ?? 0,
      })
    }

    // 3. Ngày của tháng sau (Padding cuối để đủ 35 hoặc 42 ô)
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
  }, [currentYear, currentMonth, monthData, todayStr])

  // Lấy danh sách thẻ của ngày đang chọn (nếu chọn ngày hôm nay thì lấy từ todayData)
  const isSelectedToday = selectedDateStr === todayStr
  const selectedDayDueInfo = monthData?.days?.[selectedDateStr]

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header trang Calendar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
            <CalendarIcon className="size-7 text-emerald-500" />
            <span>Lịch ôn tập Spaced Repetition</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Kế hoạch ôn tập thông minh dự báo thời điểm thẻ từ vựng đến hạn ghi
            nhớ.
          </p>
        </div>

        {todayData && todayData.totalDue > 0 && (
          <Link href={`/study/mistakes`}>
            <Button className="gap-2 rounded-xl bg-emerald-600 text-xs text-white shadow-xs hover:bg-emerald-700">
              <RotateCcw className="size-4" />
              <span>Ôn tập {todayData.totalDue} thẻ hôm nay</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Dự báo ôn tập 7 ngày tới (7-Day Forecast Bar) */}
      {todayData?.forecast7Days && (
        <div className="border-border bg-card flex flex-col gap-3 rounded-3xl border p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-muted-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <Clock className="text-primary size-3.5" />
              <span>Dự báo lịch ôn 7 ngày tới</span>
            </h3>
            <span className="text-muted-foreground text-[11px]">
              Tổng cộng{" "}
              {todayData.forecast7Days.reduce((acc, f) => acc + f.dueCount, 0)}{" "}
              lượt ôn
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {todayData.forecast7Days.map((item, idx) => {
              const isTodayItem = idx === 0
              return (
                <button
                  key={item.date}
                  type="button"
                  onClick={() => setSelectedDateStr(item.date)}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3 transition-all ${
                    selectedDateStr === item.date
                      ? "border-primary bg-primary/10 shadow-xs"
                      : isTodayItem
                        ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500"
                        : "border-border/60 bg-muted/20 hover:border-border"
                  }`}
                >
                  <span className="text-muted-foreground text-[11px] font-semibold">
                    {item.dayName}
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
      )}

      {/* Khu vực Lịch Tháng & Panel Chi tiết ngày */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* CỘT 1 & 2: CALENDAR MONTH GRID */}
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
                onClick={handleGoToday}
                className="h-7 rounded-xl px-2.5 text-[11px]"
              >
                Hôm nay
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevMonth}
                className="size-8 rounded-xl"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="size-8 rounded-xl"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Grid Lịch */}
          <div
            className={`grid grid-cols-7 gap-1.5 text-center ${loading ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}`}
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
                      setSelectedDateStr(cell.dateStr)
                    }
                  }}
                  className={`relative flex min-h-[72px] flex-col items-center justify-between rounded-2xl border p-2 text-left transition-all ${
                    !cell.isCurrentMonth
                      ? "cursor-default border-transparent bg-transparent opacity-30"
                      : isSelected
                        ? "border-primary bg-primary/10 ring-primary shadow-sm ring-1"
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
                Tháng này: {monthData.totalDueThisMonth} thẻ cần ôn
              </span>
            )}
          </div>
        </div>

        {/* CỘT 3: PANEL CHI TIẾT NGÀY ĐANG CHỌN */}
        <div className="border-border bg-card flex flex-col justify-between rounded-3xl border p-6 shadow-2xs">
          <div className="flex flex-col gap-4">
            <div className="border-border/50 flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
                  <BookOpen className="text-primary size-4" />
                  <span>Chi tiết ngày ôn tập</span>
                </h3>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Ngày {selectedDateStr} {isSelectedToday && "(Hôm nay)"}
                </p>
              </div>

              {isSelectedToday && (
                <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold text-emerald-500">
                  Hôm nay
                </Badge>
              )}
            </div>

            {/* Thông số ngày được chọn */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 border-border/50 rounded-2xl border p-3">
                <span className="text-muted-foreground text-[11px] font-medium">
                  Tổng thẻ đến hạn
                </span>
                <div className="text-foreground mt-1 text-xl font-black">
                  {isSelectedToday
                    ? (todayData?.totalDue ?? 0)
                    : (selectedDayDueInfo?.dueCount ?? 0)}
                </div>
              </div>

              <div className="bg-muted/30 border-border/50 rounded-2xl border p-3">
                <span className="text-muted-foreground text-[11px] font-medium">
                  Quá hạn ôn
                </span>
                <div className="mt-1 text-xl font-black text-rose-500">
                  {isSelectedToday ? (todayData?.overdueCount ?? 0) : 0}
                </div>
              </div>
            </div>

            {/* Danh sách thẻ chi tiết nếu là hôm nay */}
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-foreground text-xs font-bold">
                Danh sách thẻ cần ôn:
              </span>

              {isSelectedToday &&
              todayData?.cards &&
              todayData.cards.length > 0 ? (
                <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1">
                  {todayData.cards.map((card) => {
                    const statusMeta = SRS_STATUS_BADGES[card.srs.status] || {
                      label: card.srs.status,
                      className: "bg-muted text-muted-foreground",
                    }

                    return (
                      <div
                        key={card.id}
                        className="border-border/60 bg-muted/20 hover:bg-muted/40 rounded-2xl border p-3 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-foreground text-sm font-bold">
                                {card.term}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                ({card.reading})
                              </span>
                            </div>
                            <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                              {card.definition}
                            </p>
                          </div>

                          <span
                            className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${statusMeta.className}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>

                        <div className="text-muted-foreground border-border/30 mt-2 flex items-center justify-between border-t pt-1.5 text-[10px]">
                          <span>📁 {card.studySet.name}</span>
                          <span>Khoảng cách: {card.srs.interval} ngày</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="border-border/60 bg-muted/10 rounded-2xl border border-dashed py-10 text-center">
                  <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-500 opacity-60" />
                  <p className="text-muted-foreground text-xs font-medium">
                    Không có thẻ nào cần ôn tập vào ngày này.
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    Hệ thống sẽ nhắc nhở khi đến chu kỳ lặp lại tiếp theo!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Nút Ôn tập */}
          <div className="border-border/50 mt-4 border-t pt-4">
            {isSelectedToday && todayData && todayData.totalDue > 0 ? (
              <Link href="/study/mistakes" className="w-full">
                <Button className="w-full gap-2 rounded-2xl bg-emerald-600 py-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700">
                  <Play className="size-4 fill-current" />
                  <span>Bắt đầu phiên ôn tập ngay</span>
                </Button>
              </Link>
            ) : (
              <Link href="/library" className="w-full">
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-2xl py-5 text-xs"
                >
                  <BookOpen className="size-4" />
                  <span>Khám phá các bộ thẻ khác</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
