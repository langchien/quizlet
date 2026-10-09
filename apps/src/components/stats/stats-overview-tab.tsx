"use client"

import * as React from "react"
import { StatsKpiCard } from "./stats-kpi-card"
import { StatsHeatmapTab } from "./stats-heatmap-tab"
import type {
  WeeklySummaryResponse,
  HeatmapDataResponse,
} from "@/schemas/stats"

interface StatsOverviewTabProps {
  weeklySummary: WeeklySummaryResponse | null
  heatmapYear: string
  isHeatmapPending: boolean
  onYearChange: (year: string) => void
  totalHeatmapCards: number
  activeDaysCount: number
  heatmapWeeks: HeatmapDataResponse[]
  hoveredCell: {
    date: string
    count: number
    timeSpent?: number
  } | null
  setHoveredCell: (
    cell: {
      date: string
      count: number
      timeSpent?: number
    } | null
  ) => void
}

export function StatsOverviewTab({
  weeklySummary,
  heatmapYear,
  isHeatmapPending,
  onYearChange,
  totalHeatmapCards,
  activeDaysCount,
  heatmapWeeks,
  hoveredCell,
  setHoveredCell,
}: StatsOverviewTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Card Báo cáo tuần (Weekly Summary) */}
      {weeklySummary && (
        <div className="border-border bg-card grid grid-cols-1 gap-4 rounded-3xl border p-6 shadow-2xs md:grid-cols-4">
          <StatsKpiCard
            label="Thẻ đã học 7 ngày qua"
            value={weeklySummary.thisWeek.cardsStudied}
            growthPercent={weeklySummary.growth.cardsStudiedPercent}
            previousSubtext={`Tuần trước: ${weeklySummary.lastWeek.cardsStudied} thẻ`}
          />

          <StatsKpiCard
            label="Thời gian học tập"
            value={Math.round(weeklySummary.thisWeek.timeSpentSeconds / 60)}
            unit="phút"
            growthPercent={weeklySummary.growth.timeSpentPercent}
            previousSubtext={`Tuần trước: ${Math.round(weeklySummary.lastWeek.timeSpentSeconds / 60)} phút`}
          />

          <StatsKpiCard
            label="Tỷ lệ chính xác"
            value={`${weeklySummary.thisWeek.accuracy}%`}
            growthDiff={weeklySummary.growth.accuracyDiff}
            previousSubtext={`Tuần trước: ${weeklySummary.lastWeek.accuracy}%`}
            valueClassName="text-emerald-500"
          />

          <StatsKpiCard
            label="Số ngày có học"
            value={weeklySummary.thisWeek.studyDays}
            unit="/ 7 ngày"
            previousSubtext={`Tuần trước: ${weeklySummary.lastWeek.studyDays} ngày`}
          />
        </div>
      )}

      {/* GitHub-style Heatmap 365 Ngày */}
      <StatsHeatmapTab
        heatmapYear={heatmapYear}
        isHeatmapPending={isHeatmapPending}
        onYearChange={onYearChange}
        totalHeatmapCards={totalHeatmapCards}
        activeDaysCount={activeDaysCount}
        heatmapWeeks={heatmapWeeks}
        hoveredCell={hoveredCell}
        setHoveredCell={setHoveredCell}
      />
    </div>
  )
}
