"use client"

import * as React from "react"

export interface StudyModeProgressIndicatorProps {
  percentage: number
}

export function StudyModeProgressIndicator({
  percentage,
}: StudyModeProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-muted-foreground text-[11px] font-semibold">
          Tỷ lệ thuộc bài
        </div>
        <div className="text-foreground text-2xl font-black">{percentage}%</div>
      </div>
      <div className="bg-muted h-3 w-28 overflow-hidden rounded-full sm:w-36">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
