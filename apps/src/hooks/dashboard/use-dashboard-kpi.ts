"use client"

import * as React from "react"
import type { DashboardStats } from "@/types/dashboard"

export interface UseDashboardKpiProps {
  stats?: DashboardStats
}

/**
 * Hook xử lý trích xuất và tính toán định dạng số liệu cho các thẻ KPI trên Dashboard
 */
export function useDashboardKpi({ stats }: UseDashboardKpiProps) {
  const cardsStudied = stats?.cardsStudiedToday ?? 0
  const cardTarget = stats?.dailyGoal?.cardTarget ?? 20
  const cardProgress = stats?.dailyGoal?.cardProgress ?? 0

  const accuracy = stats?.accuracyToday ?? 0
  const cardsCorrect = stats?.cardsCorrectToday ?? 0
  const cardsIncorrect = stats?.cardsIncorrectToday ?? 0

  const timeSpentMinutes = React.useMemo(() => {
    return Math.round((stats?.timeSpentTodaySeconds ?? 0) / 60)
  }, [stats?.timeSpentTodaySeconds])

  const timeTargetMinutes = stats?.dailyGoal?.timeTargetMinutes ?? 15
  const timeProgressMinutes = stats?.dailyGoal?.timeProgressMinutes ?? 0

  const dueCardsCount = stats?.dueCardsCount ?? 0
  const masteredCardsCount = stats?.masteredCardsCount ?? 0

  return {
    cardsStudied,
    cardTarget,
    cardProgress,
    accuracy,
    cardsCorrect,
    cardsIncorrect,
    timeSpentMinutes,
    timeTargetMinutes,
    timeProgressMinutes,
    dueCardsCount,
    masteredCardsCount,
  }
}
