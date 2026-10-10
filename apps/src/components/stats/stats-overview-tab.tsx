"use client"

import * as React from "react"
import { StatsKpiCard } from "./stats-kpi-card"
import { StatsHeatmapTab } from "./stats-heatmap-tab"
import type {
  WeeklySummaryResponse,
  HeatmapDataResponse,
} from "@/schemas/stats"

interface StatsWeeklySummaryCardProps {
  summary: WeeklySummaryResponse
}

/**
 * Sub-component khối thẻ KPI tóm tắt báo cáo học tập trong 7 ngày qua
 */
export function StatsWeeklySummaryCard({
  summary,
}: StatsWeeklySummaryCardProps) {
  return (
    <div className="border-border bg-card grid grid-cols-1 gap-4 rounded-3xl border p-6 shadow-2xs md:grid-cols-4">
      <StatsKpiCard
        label="Thẻ đã học 7 ngày qua"
        value={summary.thisWeek.cardsStudied}
        growthPercent={summary.growth.cardsStudiedPercent}
        previousSubtext={`Tuần trước: ${summary.lastWeek.cardsStudied} thẻ`}
      />

      <StatsKpiCard
        label="Thời gian học tập"
        value={Math.round(summary.thisWeek.timeSpentSeconds / 60)}
        unit="phút"
        growthPercent={summary.growth.timeSpentPercent}
        previousSubtext={`Tuần trước: ${Math.round(summary.lastWeek.timeSpentSeconds / 60)} phút`}
      />

      <StatsKpiCard
        label="Tỷ lệ chính xác"
        value={`${summary.thisWeek.accuracy}%`}
        growthDiff={summary.growth.accuracyDiff}
        previousSubtext={`Tuần trước: ${summary.lastWeek.accuracy}%`}
        valueClassName="text-emerald-500"
      />

      <StatsKpiCard
        label="Số ngày có học"
        value={summary.thisWeek.studyDays}
        unit="/ 7 ngày"
        previousSubtext={`Tuần trước: ${summary.lastWeek.studyDays} ngày`}
      />
    </div>
  )
}

export interface StatsOverviewTabProps {
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
      {weeklySummary && <StatsWeeklySummaryCard summary={weeklySummary} />}

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
