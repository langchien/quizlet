"use client"

import * as React from "react"
import { Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoalBannerInfo } from "./goal-banner-info"

export interface DashboardGoalBannerProps {
  cardTarget?: number
  timeTargetMinutes?: number
  onOpenEditGoal: () => void
}

export function DashboardGoalBanner({
  cardTarget = 20,
  timeTargetMinutes = 15,
  onOpenEditGoal,
}: DashboardGoalBannerProps) {
  return (
    <div className="border-border bg-card flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-2xs sm:flex-row sm:items-center">
      <GoalBannerInfo
        cardTarget={cardTarget}
        timeTargetMinutes={timeTargetMinutes}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={onOpenEditGoal}
        className="self-start rounded-xl text-xs sm:self-auto"
      >
        <Edit3 data-icon="inline-start" className="size-3.5" />
        <span>Tuỳ chỉnh mục tiêu</span>
      </Button>
    </div>
  )
}
