"use client"

import * as React from "react"
import { JLPT_LEVELS, type JLPTLevel } from "@/types"

interface LandingJlptSelectorProps {
  selectedLevel: JLPTLevel | "ALL"
  onSelectLevel: (level: JLPTLevel | "ALL") => void
}

export function LandingJlptSelector({
  selectedLevel,
  onSelectLevel,
}: LandingJlptSelectorProps) {
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        Chọn cấp độ JLPT mục tiêu
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onSelectLevel("ALL")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
            selectedLevel === "ALL"
              ? "bg-primary text-primary-foreground shadow"
              : "border-border/80 bg-muted/40 hover:bg-muted border"
          }`}
        >
          Tất cả
        </button>
        {JLPT_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onSelectLevel(level)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedLevel === level
                ? "bg-primary text-primary-foreground shadow"
                : "border-border/80 bg-muted/40 hover:bg-muted border"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  )
}
