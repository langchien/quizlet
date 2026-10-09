"use client"

import * as React from "react"
import { toast } from "sonner"
import type {
  DailyStatsResponse,
  HeatmapDataResponse,
  SessionsHistoryResponse,
} from "@/schemas/stats"
import {
  getHeatmapDataAction,
  getDailyStatsAction,
  getSessionsHistoryAction,
} from "@/actions/stats"

export interface UseStatsFilterProps {
  initialHeatmapData: HeatmapDataResponse
  initialDailyStats: DailyStatsResponse[]
  initialSessionsData: SessionsHistoryResponse | null
}

export function useStatsFilter({
  initialHeatmapData,
  initialDailyStats,
  initialSessionsData,
}: UseStatsFilterProps) {
  // State Dữ liệu
  const [heatmapData, setHeatmapData] =
    React.useState<HeatmapDataResponse>(initialHeatmapData)
  const [dailyStats, setDailyStats] =
    React.useState<DailyStatsResponse[]>(initialDailyStats)
  const [sessionsData, setSessionsData] =
    React.useState<SessionsHistoryResponse | null>(initialSessionsData)

  // Bộ lọc & Phân trang
  const [timeRange, setTimeRange] = React.useState("30")
  const [heatmapYear, setHeatmapYear] = React.useState("recent")
  const [sessionPage, setSessionPage] = React.useState(1)
  const [selectedModeFilter, setSelectedModeFilter] = React.useState("all")

  // Transitions
  const [isHeatmapPending, startHeatmapTransition] = React.useTransition()
  const [isDailyPending, startDailyTransition] = React.useTransition()
  const [isSessionPending, startSessionTransition] = React.useTransition()

  // Tooltip Heatmap Cell
  const [hoveredCell, setHoveredCell] = React.useState<{
    date: string
    count: number
    timeSpent?: number
  } | null>(null)

  // Thay đổi năm Heatmap
  const handleYearChange = (year: string) => {
    setHeatmapYear(year)
    startHeatmapTransition(async () => {
      const res = await getHeatmapDataAction(year)
      if (res.success && res.data) {
        setHeatmapData(res.data)
      } else {
        toast.error(res.error || "Không thể tải dữ liệu nhiệt năm này.")
      }
    })
  }

  // Thay đổi khoảng thời gian Analytics
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range)
    startDailyTransition(async () => {
      const res = await getDailyStatsAction(range)
      if (res.success && res.data) {
        setDailyStats(res.data)
      } else {
        toast.error(res.error || "Không thể tải dữ liệu theo khoảng thời gian.")
      }
    })
  }

  // Tải lịch sử phiên học
  const loadSessions = React.useCallback((page: number, mode: string) => {
    startSessionTransition(async () => {
      const res = await getSessionsHistoryAction(page, 10, mode)
      if (res.success && res.data) {
        setSessionsData(res.data)
      } else {
        toast.error(res.error || "Không thể tải lịch sử phiên học.")
      }
    })
  }, [])

  const handleModeChange = (mode: string) => {
    setSelectedModeFilter(mode)
    setSessionPage(1)
    loadSessions(1, mode)
  }

  const handlePageChange = (newPage: number) => {
    setSessionPage(newPage)
    loadSessions(newPage, selectedModeFilter)
  }

  // Xử lý tải file JSON báo cáo
  const handleExportData = async () => {
    try {
      const res = await fetch("/api/stats/export")
      if (!res.ok) throw new Error("Không thể xuất file")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `nihomemo_stats_report_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Đã tải xuống báo cáo thống kê JSON thành công!")
    } catch (err) {
      console.error(err)
      toast.error("Có lỗi xảy ra khi xuất báo cáo.")
    }
  }

  // Chia nhỏ Heatmap thành các tuần (mỗi tuần 7 ngày từ CN -> T7)
  const heatmapWeeks = React.useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return []

    const weeks: (typeof heatmapData)[] = []
    let currentWeek: typeof heatmapData = []

    const firstDate = new Date(heatmapData[0].date)
    const startDayOfWeek = firstDate.getDay()

    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({
        date: "",
        count: 0,
        level: 0,
      })
    }

    for (const item of heatmapData) {
      currentWeek.push(item)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: "", count: 0, level: 0 })
      }
      weeks.push(currentWeek)
    }

    return weeks
  }, [heatmapData])

  const totalHeatmapCards = heatmapData.reduce((acc, c) => acc + c.count, 0)
  const activeDaysCount = heatmapData.filter((c) => c.count > 0).length

  return {
    heatmapData,
    heatmapYear,
    isHeatmapPending,
    handleYearChange,
    dailyStats,
    timeRange,
    isDailyPending,
    handleTimeRangeChange,
    sessionsData,
    sessionPage,
    selectedModeFilter,
    isSessionPending,
    handleModeChange,
    handlePageChange,
    hoveredCell,
    setHoveredCell,
    heatmapWeeks,
    totalHeatmapCards,
    activeDaysCount,
    handleExportData,
  }
}
