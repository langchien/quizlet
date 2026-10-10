"use client"

import * as React from "react"
import { Target } from "lucide-react"

export interface GoalBannerInfoProps {
  cardTarget?: number
  timeTargetMinutes?: number
}

export function GoalBannerInfo({
  cardTarget = 20,
  timeTargetMinutes = 15,
}: GoalBannerInfoProps) {
  return (
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
  )
}
