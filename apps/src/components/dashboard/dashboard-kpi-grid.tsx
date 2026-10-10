"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, CheckCircle2, Clock, Brain, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useDashboardKpi } from "@/hooks/dashboard"
import type { DashboardStats } from "@/types/dashboard"
import { DashboardKpiCard } from "./dashboard-kpi-card"

export interface DashboardKpiGridProps {
  stats: DashboardStats
}

export function DashboardKpiGrid({ stats }: DashboardKpiGridProps) {
  const {
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
  } = useDashboardKpi({ stats })

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Thẻ đã học hôm nay */}
      <DashboardKpiCard
        title="Đã học hôm nay"
        icon={<BookOpen className="size-4" />}
        iconClassName="bg-primary/10 text-primary"
        value={cardsStudied}
        subValue={`/ ${cardTarget} thẻ`}
      >
        <div className="mt-2.5 flex flex-col gap-1">
          <Progress value={cardProgress} className="h-1.5" />
          <span className="text-muted-foreground text-right text-[11px] font-medium">
            {cardProgress}% mục tiêu
          </span>
        </div>
      </DashboardKpiCard>

      {/* KPI 2: Tỷ lệ chính xác */}
      <DashboardKpiCard
        title="Độ chính xác hôm nay"
        icon={<CheckCircle2 className="size-4" />}
        iconClassName="bg-emerald-500/10 text-emerald-500"
        value={
          <span className="text-2xl font-black text-emerald-500">
            {accuracy}%
          </span>
        }
      >
        <p className="text-muted-foreground mt-2 text-[11px]">
          {cardsCorrect} đúng • {cardsIncorrect} sai
        </p>
      </DashboardKpiCard>

      {/* KPI 3: Thời gian học tập */}
      <DashboardKpiCard
        title="Thời gian học"
        icon={<Clock className="size-4" />}
        iconClassName="bg-blue-500/10 text-blue-500"
        value={timeSpentMinutes}
        subValue={`/ ${timeTargetMinutes} phút`}
      >
        <div className="mt-2.5 flex flex-col gap-1">
          <Progress value={timeProgressMinutes} className="h-1.5" />
          <span className="text-muted-foreground text-right text-[11px] font-medium">
            {timeProgressMinutes}% mục tiêu
          </span>
        </div>
      </DashboardKpiCard>

      {/* KPI 4: Thẻ cần ôn SRS (Due cards) */}
      <DashboardKpiCard
        title="Cần ôn tập hôm nay"
        icon={<Brain className="size-4" />}
        iconClassName="bg-amber-500/10 text-amber-500"
        value={
          <span className="text-2xl font-black text-amber-500">
            {dueCardsCount}
          </span>
        }
        action={
          <Button
            render={<Link href="/calendar" />}
            size="sm"
            variant="outline"
            className="h-7 rounded-lg px-2.5 text-[11px]"
          >
            <RotateCcw data-icon="inline-start" className="size-3" />
            <span>Ôn ngay</span>
          </Button>
        }
      >
        <p className="text-muted-foreground mt-2 text-[11px]">
          {masteredCardsCount} thẻ đã thuần thục ✨
        </p>
      </DashboardKpiCard>
    </div>
  )
}
