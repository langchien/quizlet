"use client"

import * as React from "react"
import { Zap } from "lucide-react"
import { StudyModeCard, type StudyModeItem } from "./study-mode-card"

interface StudyModeGridProps {
  modes: StudyModeItem[]
}

export function StudyModeGrid({ modes }: StudyModeGridProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
        <Zap className="text-primary size-4 fill-current" />
        <span>Chọn 1 trong 6 chế độ học tập</span>
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map((mode) => (
          <StudyModeCard key={mode.id} mode={mode} />
        ))}
      </div>
    </div>
  )
}
