"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, CheckCircle2, Clock, Brain, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { DashboardStats } from "@/types/dashboard"

interface DashboardKpiGridProps {
  stats: DashboardStats
}

export function DashboardKpiGrid({ stats }: DashboardKpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Thẻ đã học hôm nay */}
      <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">
            Đã học hôm nay
          </span>
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-xl">
            <BookOpen className="size-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-foreground text-2xl font-black">
              {stats?.cardsStudiedToday ?? 0}
            </span>
            <span className="text-muted-foreground text-xs font-medium">
              / {stats?.dailyGoal.cardTarget ?? 20} thẻ
            </span>
          </div>
          <div className="mt-2.5 flex flex-col gap-1">
            <Progress
              value={stats?.dailyGoal.cardProgress ?? 0}
              className="h-1.5"
            />
            <span className="text-muted-foreground text-right text-[11px] font-medium">
              {stats?.dailyGoal.cardProgress ?? 0}% mục tiêu
            </span>
          </div>
        </div>
      </div>

      {/* KPI 2: Tỷ lệ chính xác */}
      <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">
            Độ chính xác hôm nay
          </span>
          <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="size-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500">
              {stats?.accuracyToday ?? 0}%
            </span>
          </div>
          <p className="text-muted-foreground mt-2 text-[11px]">
            {stats?.cardsCorrectToday ?? 0} đúng •{" "}
            {stats?.cardsIncorrectToday ?? 0} sai
          </p>
        </div>
      </div>

      {/* KPI 3: Thời gian học tập */}
      <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">
            Thời gian học
          </span>
          <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Clock className="size-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-foreground text-2xl font-black">
              {Math.round((stats?.timeSpentTodaySeconds ?? 0) / 60)}
            </span>
            <span className="text-muted-foreground text-xs font-medium">
              / {stats?.dailyGoal.timeTargetMinutes ?? 15} phút
            </span>
          </div>
          <div className="mt-2.5 flex flex-col gap-1">
            <Progress
              value={stats?.dailyGoal.timeProgressMinutes ?? 0}
              className="h-1.5"
            />
            <span className="text-muted-foreground text-right text-[11px] font-medium">
              {stats?.dailyGoal.timeProgressMinutes ?? 0}% mục tiêu
            </span>
          </div>
        </div>
      </div>

      {/* KPI 4: Thẻ cần ôn SRS (Due cards) */}
      <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">
            Cần ôn tập hôm nay
          </span>
          <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Brain className="size-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-500">
              {stats?.dueCardsCount ?? 0}
            </span>
            <Link href="/calendar">
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-lg px-2.5 text-[11px]"
              >
                <RotateCcw className="mr-1 size-3" />
                Ôn ngay
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground mt-2 text-[11px]">
            {stats?.masteredCardsCount ?? 0} thẻ đã thuần thục ✨
          </p>
        </div>
      </div>
    </div>
  )
}
