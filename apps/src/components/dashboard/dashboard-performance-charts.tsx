"use client"

import * as React from "react"
import { useDashboardCharts } from "@/hooks/dashboard"
import type { DashboardStats } from "@/types/dashboard"
import { WeeklyProgressChart } from "./weekly-progress-chart"
import { ModeAccuracyChart } from "./mode-accuracy-chart"

export interface DashboardPerformanceChartsProps {
  weeklyChart?: DashboardStats["weeklyChart"]
  modeAccuracies?: DashboardStats["modeAccuracies"]
}

export function DashboardPerformanceCharts({
  weeklyChart,
  modeAccuracies,
}: DashboardPerformanceChartsProps) {
  const {
    hasWeeklyData,
    hasModeData,
    weeklyChart: weeklyData,
    modeAccuracies: modeData,
    formatCardsTooltip,
    formatWeeklyLabel,
    formatAccuracyTooltip,
    formatModeTick,
    formatModeLabel,
  } = useDashboardCharts({
    weeklyChart,
    modeAccuracies,
  })

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Biểu đồ hoạt động 7 ngày (2 Cột) */}
      <WeeklyProgressChart
        data={weeklyData}
        hasData={hasWeeklyData}
        formatCardsTooltip={formatCardsTooltip}
        formatWeeklyLabel={formatWeeklyLabel}
      />

      {/* Biểu đồ độ chính xác theo Study Mode (1 Cột) */}
      <ModeAccuracyChart
        data={modeData}
        hasData={hasModeData}
        formatAccuracyTooltip={formatAccuracyTooltip}
        formatModeTick={formatModeTick}
        formatModeLabel={formatModeLabel}
      />
    </div>
  )
}
