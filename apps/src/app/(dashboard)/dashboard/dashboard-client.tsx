"use client"

import * as React from "react"
import { useDailyGoal } from "@/hooks/dashboard"
import {
  DashboardWelcomeBanner,
  DashboardKpiGrid,
  DashboardGoalBanner,
  DashboardPerformanceCharts,
  DashboardRecentSessions,
  DashboardRecentSets,
  DashboardGoalDialog,
} from "@/components/dashboard"
import type { RecentSetItem, DashboardStats } from "@/types/dashboard"

export type { RecentSetItem, DashboardStats }

interface DashboardClientProps {
  initialStats: DashboardStats
  recentSets: RecentSetItem[]
  userName: string
}

export function DashboardClient({
  initialStats,
  recentSets,
  userName,
}: DashboardClientProps) {
  const {
    goalDialogOpen,
    setGoalDialogOpen,
    cardTargetInput,
    setCardTargetInput,
    timeTargetInput,
    setTimeTargetInput,
    isPending,
    handleSaveGoal,
  } = useDailyGoal({ dailyGoal: initialStats?.dailyGoal })

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* 1. Header Banner Chào mừng & Streak Flame */}
      <DashboardWelcomeBanner
        userName={userName}
        currentStreak={initialStats?.currentStreak}
      />

      {/* 2. 4 Thẻ KPI Chỉ số chính */}
      <DashboardKpiGrid stats={initialStats} />

      {/* 3. Banner Mục tiêu học tập hàng ngày */}
      <DashboardGoalBanner
        cardTarget={initialStats?.dailyGoal.cardTarget}
        timeTargetMinutes={initialStats?.dailyGoal.timeTargetMinutes}
        onOpenEditGoal={() => setGoalDialogOpen(true)}
      />

      {/* 4. Biểu đồ 7 ngày & Hiệu suất theo chế độ */}
      <DashboardPerformanceCharts
        weeklyChart={initialStats?.weeklyChart}
        modeAccuracies={initialStats?.modeAccuracies}
      />

      {/* 5. Phiên học gần đây */}
      <DashboardRecentSessions sessions={initialStats?.recentSessions} />

      {/* 6. Bộ thẻ học tập gần đây */}
      <DashboardRecentSets recentSets={recentSets} />

      {/* Dialog Cập nhật mục tiêu */}
      <DashboardGoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        cardTarget={cardTargetInput}
        onCardTargetChange={setCardTargetInput}
        timeTarget={timeTargetInput}
        onTimeTargetChange={setTimeTargetInput}
        onSave={handleSaveGoal}
        isPending={isPending}
      />
    </div>
  )
}
