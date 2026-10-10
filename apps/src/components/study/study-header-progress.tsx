"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface StudyHeaderProgressProps {
  current: number
  total: number
  calculatedProgress: number
  progressColor?: string
  counterLabel?: string
}

export function StudyHeaderProgress({
  current,
  total,
  calculatedProgress,
  progressColor = "bg-primary",
  counterLabel,
}: StudyHeaderProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground text-xs font-bold">
        <span className="text-foreground text-sm font-black">{current}</span> /{" "}
        {total}
        {counterLabel && ` ${counterLabel}`}
      </div>
      <div className="bg-muted h-2 w-28 overflow-hidden rounded-full sm:w-44 md:w-56">
        <div
          className={cn("h-full transition-all duration-300", progressColor)}
          style={{ width: `${calculatedProgress}%` }}
        />
      </div>
    </div>
  )
}
