"use client"

import * as React from "react"
import { Target, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardGoalBannerProps {
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
      <div className="flex items-center gap-3.5">
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-2xl">
          <Target className="size-5" />
        </div>
        <div>
          <h3 className="text-foreground text-sm font-bold">
            Mục tiêu học tập hàng ngày
          </h3>
          <p className="text-muted-foreground text-xs">
            Mục tiêu: {cardTarget} thẻ • {timeTargetMinutes} phút học mỗi ngày
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onOpenEditGoal}
        className="gap-1.5 self-start rounded-xl text-xs sm:self-auto"
      >
        <Edit3 className="size-3.5" />
        <span>Tuỳ chỉnh mục tiêu</span>
      </Button>
    </div>
  )
}
