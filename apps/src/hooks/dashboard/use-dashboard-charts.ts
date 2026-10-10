"use client"

import * as React from "react"
import { STUDY_MODE_LABELS, type DashboardStats } from "@/types/dashboard"

export interface UseDashboardChartsProps {
  weeklyChart?: DashboardStats["weeklyChart"]
  modeAccuracies?: DashboardStats["modeAccuracies"]
}

/**
 * Hook xử lý chuẩn bị dữ liệu và hàm format cho các biểu đồ hiệu suất học tập
 */
export function useDashboardCharts({
  weeklyChart,
  modeAccuracies,
}: UseDashboardChartsProps) {
  const hasWeeklyData = Boolean(weeklyChart && weeklyChart.length > 0)
  const hasModeData = Boolean(modeAccuracies && modeAccuracies.length > 0)

  const formatCardsTooltip = React.useCallback((value: unknown) => {
    return [`${value} thẻ`, "Đã học"] as [string, string]
  }, [])

  const formatWeeklyLabel = React.useCallback(
    (
      label: unknown,
      payload?: readonly { payload?: { dayName?: string; date?: string } }[]
    ) => {
      if (payload?.[0]?.payload) {
        const item = payload[0].payload
        return `${item.dayName} (${item.date})`
      }
      return typeof label === "string" ? label : String(label ?? "")
    },
    []
  )

  const formatAccuracyTooltip = React.useCallback((val: unknown) => {
    return [`${val}%`, "Độ chính xác"] as [string, string]
  }, [])

  const formatModeTick = React.useCallback((val: string) => {
    return STUDY_MODE_LABELS[val]?.label || val
  }, [])

  const formatModeLabel = React.useCallback((label: unknown) => {
    const key = typeof label === "string" ? label : String(label ?? "")
    return STUDY_MODE_LABELS[key]?.label || key
  }, [])

  return {
    hasWeeklyData,
    hasModeData,
    weeklyChart: weeklyChart ?? [],
    modeAccuracies: modeAccuracies ?? [],
    formatCardsTooltip,
    formatWeeklyLabel,
    formatAccuracyTooltip,
    formatModeTick,
    formatModeLabel,
  }
}
