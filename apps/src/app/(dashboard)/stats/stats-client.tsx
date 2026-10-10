"use client"

import * as React from "react"
import { BarChart3 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useStatsFilter } from "@/hooks/stats"
import {
  StatsExportMenu,
  StatsOverviewTab,
  StatsAnalyticsTab,
  StatsSessionsTab,
} from "@/components/stats"
import type {
  DailyStatsResponse,
  HeatmapDataResponse,
  WeeklySummaryResponse,
  SessionsHistoryResponse,
} from "@/schemas/stats"

interface StatsClientProps {
  initialHeatmapData: HeatmapDataResponse
  initialWeeklySummary: WeeklySummaryResponse | null
  initialDailyStats: DailyStatsResponse[]
  initialSrsDistribution: { name: string; value: number; color: string }[]
  initialTopSets: { name: string; count: number }[]
  initialSessionsData: SessionsHistoryResponse | null
}

export function StatsClient({
  initialHeatmapData,
  initialWeeklySummary,
  initialDailyStats,
  initialSrsDistribution,
  initialTopSets,
  initialSessionsData,
}: StatsClientProps) {
  const [activeTab, setActiveTab] = React.useState("overview")

  const stats = useStatsFilter({
    initialHeatmapData,
    initialDailyStats,
    initialSessionsData,
  })

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

        <StatsExportMenu onExport={stats.handleExportData} />
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
        <TabsContent value="overview" className="m-0">
          <StatsOverviewTab
            weeklySummary={initialWeeklySummary}
            heatmapYear={stats.heatmapYear}
            isHeatmapPending={stats.isHeatmapPending}
            onYearChange={stats.handleYearChange}
            totalHeatmapCards={stats.totalHeatmapCards}
            activeDaysCount={stats.activeDaysCount}
            heatmapWeeks={stats.heatmapWeeks}
            hoveredCell={stats.hoveredCell}
            setHoveredCell={stats.setHoveredCell}
          />
        </TabsContent>

        {/* TAB 2: PHÂN TÍCH CHI TIẾT (ANALYTICS) */}
        <TabsContent value="analytics" className="m-0">
          <StatsAnalyticsTab
            dailyStats={stats.dailyStats}
            timeRange={stats.timeRange}
            isDailyPending={stats.isDailyPending}
            onTimeRangeChange={stats.handleTimeRangeChange}
            srsDistribution={initialSrsDistribution}
            topSets={initialTopSets}
          />
        </TabsContent>

        {/* TAB 3: LỊCH SỬ PHIÊN HỌC (SESSION HISTORY) */}
        <TabsContent value="history" className="m-0">
          <StatsSessionsTab
            sessionsData={stats.sessionsData}
            sessionPage={stats.sessionPage}
            selectedModeFilter={stats.selectedModeFilter}
            isSessionPending={stats.isSessionPending}
            onModeChange={stats.handleModeChange}
            onPageChange={stats.handlePageChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
