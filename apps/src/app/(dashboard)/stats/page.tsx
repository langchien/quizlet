"use client"

import * as React from "react"
import {
  BarChart3,
  Download,
  Flame,
  TrendingUp,
  Brain,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { toast } from "sonner"
import type {
  DailyStatsResponse,
  HeatmapDataResponse,
  WeeklySummaryResponse,
  SessionsHistoryResponse,
} from "@/schemas/stats"

const STUDY_MODE_CONFIG: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  Flashcard: { label: "Flashcard", icon: "🃏", color: "text-blue-500" },
  Learn: { label: "Học thích ứng", icon: "📖", color: "text-purple-500" },
  Test: { label: "Kiểm tra", icon: "📝", color: "text-amber-500" },
  Match: { label: "Ghép từ", icon: "🧩", color: "text-pink-500" },
  Write: { label: "Viết đáp án", icon: "✍️", color: "text-emerald-500" },
  Listen: { label: "Nghe & viết", icon: "🎧", color: "text-cyan-500" },
}

const SRS_STATUS_COLORS: Record<string, { label: string; color: string }> = {
  New: { label: "Mới tạo", color: "#3B82F6" }, // Blue
  Learning: { label: "Đang học", color: "#F59E0B" }, // Amber
  Review: { label: "Ôn tập", color: "#8B5CF6" }, // Purple
  Mastered: { label: "Thuần thục", color: "#10B981" }, // Emerald
}

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = React.useState("overview")

  // State Dữ liệu
  const [heatmapData, setHeatmapData] = React.useState<HeatmapDataResponse>([])
  const [weeklySummary, setWeeklySummary] =
    React.useState<WeeklySummaryResponse | null>(null)
  const [dailyStats, setDailyStats] = React.useState<DailyStatsResponse[]>([])
  const [sessionsData, setSessionsData] =
    React.useState<SessionsHistoryResponse | null>(null)
  const [srsDistribution, setSrsDistribution] = React.useState<
    { name: string; value: number; color: string }[]
  >([])
  const [topSets, setTopSets] = React.useState<
    { name: string; count: number }[]
  >([])

  // Bộ lọc & Phân trang
  const [timeRange, setTimeRange] = React.useState("30") // 7, 30, 90, all
  const [heatmapYear, setHeatmapYear] = React.useState("recent") // recent, 2026, 2025
  const [sessionPage, setSessionPage] = React.useState(1)
  const [selectedModeFilter, setSelectedModeFilter] = React.useState("all")
  const [loading, setLoading] = React.useState(true)

  // Tooltip Heatmap Cell
  const [hoveredCell, setHoveredCell] = React.useState<{
    date: string
    count: number
    timeSpent?: number
  } | null>(null)

  // 1. Tải dữ liệu Heatmap & Weekly Summary
  const fetchOverviewData = React.useCallback(async () => {
    try {
      setLoading(true)
      const yearQuery = heatmapYear === "recent" ? "" : `?year=${heatmapYear}`
      const [heatRes, weekRes] = await Promise.all([
        fetch(`/api/stats/heatmap${yearQuery}`),
        fetch("/api/stats/weekly-summary"),
      ])

      if (heatRes.ok) {
        setHeatmapData(await heatRes.json())
      }
      if (weekRes.ok) {
        setWeeklySummary(await weekRes.json())
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu tổng quan:", err)
    } finally {
      setLoading(false)
    }
  }, [heatmapYear])

  // 2. Tải dữ liệu Analytics (Chi tiết)
  const fetchAnalyticsData = React.useCallback(async () => {
    try {
      const now = new Date()
      const toDate = now.toISOString().split("T")[0]
      let fromDate = ""

      if (timeRange === "7") {
        const d = new Date(now)
        d.setDate(d.getDate() - 6)
        fromDate = d.toISOString().split("T")[0]
      } else if (timeRange === "30") {
        const d = new Date(now)
        d.setDate(d.getDate() - 29)
        fromDate = d.toISOString().split("T")[0]
      } else if (timeRange === "90") {
        const d = new Date(now)
        d.setDate(d.getDate() - 89)
        fromDate = d.toISOString().split("T")[0]
      }

      const query = fromDate ? `?from=${fromDate}&to=${toDate}` : ""
      const [dailyRes, setsRes] = await Promise.all([
        fetch(`/api/stats/daily${query}`),
        fetch("/api/sets?limit=100"),
      ])

      if (dailyRes.ok) {
        setDailyStats(await dailyRes.json())
      }

      // Lấy phân bố SRS từ export endpoint hoặc sets
      const exportRes = await fetch("/api/stats/export")
      if (exportRes.ok) {
        const exportJson = await exportRes.json()
        const dist = exportJson.summary?.srsDistribution || {}
        setSrsDistribution([
          {
            name: "Mới tạo",
            value: dist.New || 0,
            color: SRS_STATUS_COLORS.New.color,
          },
          {
            name: "Đang học",
            value: dist.Learning || 0,
            color: SRS_STATUS_COLORS.Learning.color,
          },
          {
            name: "Ôn tập",
            value: dist.Review || 0,
            color: SRS_STATUS_COLORS.Review.color,
          },
          {
            name: "Thuần thục",
            value: dist.Mastered || 0,
            color: SRS_STATUS_COLORS.Mastered.color,
          },
        ])

        if (setsRes.ok) {
          const setsJson = await setsRes.json()
          const top = (setsJson.items || [])
            .map((s: { name: string; cardCount: number }) => ({
              name: s.name,
              count: s.cardCount,
            }))
            .slice(0, 5)
          setTopSets(top)
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu chi tiết:", err)
    }
  }, [timeRange])

  // 3. Tải Lịch sử phiên học
  const fetchSessionsHistory = React.useCallback(async () => {
    try {
      const modeQuery =
        selectedModeFilter !== "all" ? `&mode=${selectedModeFilter}` : ""
      const res = await fetch(
        `/api/stats/sessions?page=${sessionPage}&limit=10${modeQuery}`
      )
      if (res.ok) {
        setSessionsData(await res.json())
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch sử phiên học:", err)
    }
  }, [sessionPage, selectedModeFilter])

  React.useEffect(() => {
    fetchOverviewData()
  }, [fetchOverviewData])

  React.useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalyticsData()
    } else if (activeTab === "history") {
      fetchSessionsHistory()
    }
  }, [activeTab, fetchAnalyticsData, fetchSessionsHistory])

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

    // Xác định thứ trong tuần của ngày đầu tiên (0: CN, 6: T7)
    const firstDate = new Date(heatmapData[0].date)
    const startDayOfWeek = firstDate.getDay()

    // Bổ sung các ô trống đầu tuần nếu ngày đầu tiên không phải CN
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

  // Tính tổng thẻ đã học toàn thời gian trong heatmap
  const totalHeatmapCards = heatmapData.reduce((acc, c) => acc + c.count, 0)
  const activeDaysCount = heatmapData.filter((c) => c.count > 0).length

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header trang Thống kê */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
            <BarChart3 className="text-primary size-7" />
            <span>Thống kê & Báo cáo học tập</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Theo dõi chi tiết hiệu suất, chuỗi ngày học liên tục và phân tích
            chuyên sâu theo thuật toán Spaced Repetition.
          </p>
        </div>

        <Button
          onClick={handleExportData}
          variant="outline"
          className="gap-2 self-start rounded-xl text-xs shadow-2xs sm:self-auto"
        >
          <Download className="size-4" />
          <span>Xuất dữ liệu JSON</span>
        </Button>
      </div>

      {/* 3 Tabs Điều hướng */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-6"
      >
        <TabsList className="bg-muted/60 border-border w-fit rounded-2xl border p-1">
          <TabsTrigger
            value="overview"
            className="rounded-xl px-4 py-2 text-xs font-semibold"
          >
            📊 Tổng quan 365 ngày
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-xl px-4 py-2 text-xs font-semibold"
          >
            📈 Phân tích chi tiết
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-xl px-4 py-2 text-xs font-semibold"
          >
            📜 Lịch sử phiên học
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: TỔNG QUAN (OVERVIEW) */}
        <TabsContent
          value="overview"
          className={`m-0 flex flex-col gap-6 transition-opacity ${loading ? "pointer-events-none opacity-60" : ""}`}
        >
          {/* Card Báo cáo tuần (Weekly Summary) */}
          {weeklySummary && (
            <div className="border-border bg-card grid grid-cols-1 gap-4 rounded-3xl border p-6 shadow-2xs md:grid-cols-4">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs font-medium">
                  Thẻ đã học 7 ngày qua
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-foreground text-2xl font-black">
                    {weeklySummary.thisWeek.cardsStudied}
                  </span>
                  <Badge
                    variant={
                      weeklySummary.growth.cardsStudiedPercent >= 0
                        ? "default"
                        : "secondary"
                    }
                    className="gap-1 text-[10px] font-bold"
                  >
                    {weeklySummary.growth.cardsStudiedPercent >= 0 ? (
                      <ArrowUpRight className="size-3 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="size-3 text-rose-400" />
                    )}
                    {Math.abs(weeklySummary.growth.cardsStudiedPercent)}%
                  </Badge>
                </div>
                <span className="text-muted-foreground text-[11px]">
                  Tuần trước: {weeklySummary.lastWeek.cardsStudied} thẻ
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs font-medium">
                  Thời gian học tập
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-foreground text-2xl font-black">
                    {Math.round(weeklySummary.thisWeek.timeSpentSeconds / 60)}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium">
                    phút
                  </span>
                  <Badge
                    variant={
                      weeklySummary.growth.timeSpentPercent >= 0
                        ? "default"
                        : "secondary"
                    }
                    className="gap-1 text-[10px] font-bold"
                  >
                    {weeklySummary.growth.timeSpentPercent >= 0 ? "+" : ""}
                    {weeklySummary.growth.timeSpentPercent}%
                  </Badge>
                </div>
                <span className="text-muted-foreground text-[11px]">
                  Tuần trước:{" "}
                  {Math.round(weeklySummary.lastWeek.timeSpentSeconds / 60)}{" "}
                  phút
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs font-medium">
                  Tỷ lệ chính xác
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-500">
                    {weeklySummary.thisWeek.accuracy}%
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ({weeklySummary.growth.accuracyDiff >= 0 ? "+" : ""}
                    {weeklySummary.growth.accuracyDiff}%)
                  </span>
                </div>
                <span className="text-muted-foreground text-[11px]">
                  Tuần trước: {weeklySummary.lastWeek.accuracy}%
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs font-medium">
                  Số ngày có học
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-foreground text-2xl font-black">
                    {weeklySummary.thisWeek.studyDays}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium">
                    / 7 ngày
                  </span>
                </div>
                <span className="text-muted-foreground text-[11px]">
                  Tuần trước: {weeklySummary.lastWeek.studyDays} ngày
                </span>
              </div>
            </div>
          )}

          {/* GitHub-style Heatmap 365 Ngày */}
          <div className="border-border bg-card flex flex-col gap-4 rounded-3xl border p-6 shadow-2xs">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
                  <Flame className="size-4 text-amber-500" />
                  <span>Biểu đồ hoạt động 365 ngày (Heatmap)</span>
                </h3>
                <p className="text-muted-foreground text-xs">
                  Tổng cộng {totalHeatmapCards} thẻ đã ôn luyện trong{" "}
                  {activeDaysCount} ngày hoạt động
                </p>
              </div>

              {/* Bộ lọc chọn năm */}
              <div className="bg-muted/50 border-border flex items-center gap-1.5 rounded-xl border p-1">
                <Button
                  variant={heatmapYear === "recent" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setHeatmapYear("recent")}
                  className="h-7 rounded-lg px-2.5 text-[11px]"
                >
                  365 ngày qua
                </Button>
                <Button
                  variant={heatmapYear === "2026" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setHeatmapYear("2026")}
                  className="h-7 rounded-lg px-2.5 text-[11px]"
                >
                  2026
                </Button>
                <Button
                  variant={heatmapYear === "2025" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setHeatmapYear("2025")}
                  className="h-7 rounded-lg px-2.5 text-[11px]"
                >
                  2025
                </Button>
              </div>
            </div>

            {/* Grid Heatmap cuộn ngang */}
            <div className="overflow-x-auto pt-1 pb-2">
              <div className="inline-flex min-w-[750px] flex-col gap-1.5">
                {/* Header Thứ */}
                <div className="flex items-center gap-1.5">
                  <div className="w-8" />
                  {heatmapWeeks.map((_, weekIdx) => {
                    // Hiển thị nhãn tháng ở đầu mỗi tháng
                    const firstDayInWeek = heatmapWeeks[weekIdx][0]
                    let monthLabel = ""
                    if (firstDayInWeek?.date) {
                      const d = new Date(firstDayInWeek.date)
                      if (d.getDate() <= 7) {
                        monthLabel = `T${d.getMonth() + 1}`
                      }
                    }
                    return (
                      <div
                        key={weekIdx}
                        className="text-muted-foreground w-3 text-center text-[10px] font-semibold"
                      >
                        {monthLabel}
                      </div>
                    )
                  })}
                </div>

                {/* Các hàng thứ trong tuần (0: CN, 1: T2, ..., 6: T7) */}
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                  const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
                  return (
                    <div key={dayOfWeek} className="flex items-center gap-1.5">
                      <span className="text-muted-foreground w-8 text-[10px] font-medium">
                        {dayLabels[dayOfWeek]}
                      </span>

                      {heatmapWeeks.map((week, weekIdx) => {
                        const cell = week[dayOfWeek]
                        if (!cell || !cell.date) {
                          return (
                            <div
                              key={weekIdx}
                              className="size-3 rounded-[3px] opacity-0"
                            />
                          )
                        }

                        // Màu sắc cấp độ theo CSS variable
                        let bgClass = "bg-muted/40 border-border/40"
                        if (cell.level === 1)
                          bgClass =
                            "bg-emerald-500/30 dark:bg-emerald-500/30 border-emerald-500/40"
                        if (cell.level === 2)
                          bgClass =
                            "bg-emerald-500/55 dark:bg-emerald-500/55 border-emerald-500/60"
                        if (cell.level === 3)
                          bgClass =
                            "bg-emerald-500/80 dark:bg-emerald-500/80 border-emerald-500/90"
                        if (cell.level === 4)
                          bgClass =
                            "bg-emerald-500 text-white font-bold border-emerald-400"

                        return (
                          <div
                            key={weekIdx}
                            onMouseEnter={() => setHoveredCell(cell)}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`size-3 cursor-pointer rounded-[3px] border transition-transform hover:scale-125 ${bgClass}`}
                          />
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Chú giải cấp độ và Tooltip Hover */}
            <div className="border-border/50 flex flex-col justify-between gap-2 border-t pt-3 text-xs sm:flex-row sm:items-center">
              <div className="text-muted-foreground min-h-[16px] text-[11px]">
                {hoveredCell ? (
                  <span className="text-foreground font-semibold">
                    📅 Ngày {hoveredCell.date}:{" "}
                    <span className="text-primary font-bold">
                      {hoveredCell.count} thẻ
                    </span>
                    {hoveredCell.timeSpent !== undefined &&
                      ` (${Math.round(hoveredCell.timeSpent / 60)} phút)`}
                  </span>
                ) : (
                  <span>Rê chuột vào từng ô để xem chi tiết ngày học</span>
                )}
              </div>

              <div className="text-muted-foreground flex items-center gap-1.5 self-end text-[11px] sm:self-auto">
                <span>Ít</span>
                <div className="bg-muted/40 border-border/40 size-2.5 rounded-[2px] border" />
                <div className="size-2.5 rounded-[2px] bg-emerald-500/30" />
                <div className="size-2.5 rounded-[2px] bg-emerald-500/55" />
                <div className="size-2.5 rounded-[2px] bg-emerald-500/80" />
                <div className="size-2.5 rounded-[2px] bg-emerald-500" />
                <span>Nhiều</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: PHÂN TÍCH CHI TIẾT (ANALYTICS) */}
        <TabsContent value="analytics" className="m-0 flex flex-col gap-6">
          {/* Bộ lọc khoảng thời gian */}
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
              <TrendingUp className="text-primary size-4" />
              <span>Biểu đồ tiến độ chi tiết</span>
            </h3>

            <div className="bg-muted/50 border-border flex items-center gap-1.5 rounded-xl border p-1">
              {[
                { label: "7 ngày", val: "7" },
                { label: "30 ngày", val: "30" },
                { label: "90 ngày", val: "90" },
                { label: "Tất cả", val: "all" },
              ].map((item) => (
                <Button
                  key={item.val}
                  variant={timeRange === item.val ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTimeRange(item.val)}
                  className="h-7 rounded-lg px-2.5 text-[11px] font-semibold"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Biểu đồ hoạt động theo ngày */}
          <div className="border-border bg-card rounded-3xl border p-6 shadow-2xs">
            <h4 className="text-foreground mb-1 text-sm font-bold">
              Số thẻ học & Độ chính xác theo ngày
            </h4>
            <p className="text-muted-foreground mb-4 text-xs">
              Theo dõi số thẻ hoàn thành và tỷ lệ chính xác
            </p>

            <div className="h-72 w-full">
              {dailyStats && dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailyStats}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="studiedGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--primary)"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--primary)"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="date"
                      stroke="var(--muted-foreground)"
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                      }}
                      formatter={(value: unknown, name: unknown) => [
                        name === "cardsStudied"
                          ? `${value} thẻ`
                          : name === "cardsCorrect"
                            ? `${value} đúng`
                            : `${value}%`,
                        name === "cardsStudied"
                          ? "Tổng số thẻ"
                          : name === "cardsCorrect"
                            ? "Thẻ đúng"
                            : "Độ chính xác",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="cardsStudied"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#studiedGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                  Chưa có dữ liệu học tập trong khoảng thời gian này.
                </div>
              )}
            </div>
          </div>

          {/* Grid 2 Biểu đồ: Phân bố SRS Donut & Top Sets */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Biểu đồ Donut Phân bố SRS */}
            <div className="border-border bg-card flex flex-col justify-between rounded-3xl border p-6 shadow-2xs">
              <div>
                <h4 className="text-foreground flex items-center gap-2 text-sm font-bold">
                  <Brain className="size-4 text-purple-500" />
                  <span>Phân bố trạng thái Spaced Repetition</span>
                </h4>
                <p className="text-muted-foreground mt-1 text-xs">
                  Mức độ thuần thục của toàn bộ thẻ từ vựng
                </p>
              </div>

              <div className="my-3 h-64 w-full">
                {srsDistribution &&
                srsDistribution.some((item) => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={srsDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {srsDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "0.75rem",
                          fontSize: "12px",
                        }}
                        formatter={(val: unknown) => [`${val} thẻ`, "Số lượng"]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(val) => (
                          <span className="text-foreground text-xs font-medium">
                            {val}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                    Chưa có dữ liệu SRS.
                  </div>
                )}
              </div>
            </div>

            {/* Biểu đồ Bar Top Bộ thẻ */}
            <div className="border-border bg-card flex flex-col justify-between rounded-3xl border p-6 shadow-2xs">
              <div>
                <h4 className="text-foreground flex items-center gap-2 text-sm font-bold">
                  <Layers className="size-4 text-blue-500" />
                  <span>Top bộ thẻ quy mô lớn nhất</span>
                </h4>
                <p className="text-muted-foreground mt-1 text-xs">
                  Số lượng thẻ trong các bộ thẻ hàng đầu
                </p>
              </div>

              <div className="my-3 h-64 w-full">
                {topSets && topSets.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topSets}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        type="number"
                        stroke="var(--muted-foreground)"
                        fontSize={11}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="var(--muted-foreground)"
                        fontSize={11}
                        width={90}
                        tickFormatter={(v) =>
                          v.length > 12 ? `${v.slice(0, 12)}...` : v
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "0.75rem",
                          fontSize: "12px",
                        }}
                        formatter={(val: unknown) => [`${val} thẻ`, "Quy mô"]}
                      />
                      <Bar
                        dataKey="count"
                        fill="#3B82F6"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                    Chưa có bộ thẻ nào.
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: LỊCH SỬ PHIÊN HỌC (SESSION HISTORY) */}
        <TabsContent value="history" className="m-0 flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-foreground text-sm font-bold">
                Nhật ký tất cả các phiên học tập
              </h3>
              <p className="text-muted-foreground text-xs">
                Tổng cộng {sessionsData?.pagination.total ?? 0} phiên học được
                lưu trong hệ thống
              </p>
            </div>

            {/* Bộ lọc Mode */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs font-medium">
                Chế độ:
              </span>
              <select
                value={selectedModeFilter}
                onChange={(e) => {
                  setSelectedModeFilter(e.target.value)
                  setSessionPage(1)
                }}
                className="bg-card border-border text-foreground rounded-xl border px-3 py-1.5 text-xs focus:outline-none"
              >
                <option value="all">Tất cả chế độ</option>
                <option value="Flashcard">🃏 Flashcard</option>
                <option value="Learn">📖 Học thích ứng</option>
                <option value="Test">📝 Kiểm tra</option>
                <option value="Match">🧩 Ghép từ</option>
                <option value="Write">✍️ Viết đáp án</option>
                <option value="Listen">🎧 Nghe & viết</option>
              </select>
            </div>
          </div>

          {/* Bảng Danh sách Phiên học */}
          <div className="border-border bg-card overflow-hidden rounded-3xl border shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-bold">Chế độ</TableHead>
                  <TableHead className="text-xs font-bold">Bộ thẻ</TableHead>
                  <TableHead className="text-xs font-bold">Thời gian</TableHead>
                  <TableHead className="text-xs font-bold">
                    Thời lượng
                  </TableHead>
                  <TableHead className="text-xs font-bold">Số thẻ</TableHead>
                  <TableHead className="text-right text-xs font-bold">
                    Điểm / Kết quả
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionsData?.sessions && sessionsData.sessions.length > 0 ? (
                  sessionsData.sessions.map((s) => {
                    const modeMeta = STUDY_MODE_CONFIG[s.mode] || {
                      label: s.mode,
                      icon: "📚",
                      color: "text-foreground",
                    }
                    const formattedDate = new Date(
                      s.startedAt
                    ).toLocaleDateString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })

                    return (
                      <TableRow key={s.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-base">{modeMeta.icon}</span>
                            <span className="text-foreground text-xs font-bold">
                              {modeMeta.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-xs font-medium">
                            {s.studySet?.name || "Luyện tập tự do"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-xs">
                            {formattedDate}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-xs">
                            {Math.round(s.duration / 60)} phút ({s.duration}s)
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-foreground text-xs font-medium">
                            {s.correctCards} / {s.totalCards} thẻ
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              s.score >= 80
                                ? "default"
                                : s.score >= 50
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs font-bold"
                          >
                            {Math.round(s.score)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center text-xs"
                    >
                      Không tìm thấy phiên học nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Phân trang */}
            {sessionsData && sessionsData.pagination.totalPages > 1 && (
              <div className="border-border/50 flex items-center justify-between border-t px-6 py-4">
                <span className="text-muted-foreground text-xs">
                  Trang {sessionsData.pagination.page} /{" "}
                  {sessionsData.pagination.totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={sessionPage <= 1}
                    onClick={() => setSessionPage((p) => Math.max(1, p - 1))}
                    className="gap-1 rounded-xl text-xs"
                  >
                    <ChevronLeft className="size-3.5" />
                    <span>Trước</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={sessionPage >= sessionsData.pagination.totalPages}
                    onClick={() =>
                      setSessionPage((p) =>
                        Math.min(sessionsData.pagination.totalPages, p + 1)
                      )
                    }
                    className="gap-1 rounded-xl text-xs"
                  >
                    <span>Sau</span>
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
