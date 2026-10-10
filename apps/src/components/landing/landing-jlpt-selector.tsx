"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { JLPT_LEVELS, type JLPTLevel } from "@/types"

interface JlptLevelButtonProps {
  label: string
  isSelected: boolean
  onClick: () => void
}

/**
 * Sub-component nút chọn cấp độ JLPT chuẩn Shadcn Button
 */
export function JlptLevelButton({
  label,
  isSelected,
  onClick,
}: JlptLevelButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={isSelected ? "default" : "outline"}
      onClick={onClick}
      className={cn(
        "h-7.5 px-3.5 text-xs font-semibold transition-all",
        !isSelected && "border-border/80 bg-muted/40 hover:bg-muted"
      )}
    >
      {label}
    </Button>
  )
}

export interface LandingJlptSelectorProps {
  selectedLevel: JLPTLevel | "ALL"
  onSelectLevel?: (level: JLPTLevel | "ALL") => void
  handleSelectLevel?: (level: JLPTLevel | "ALL") => void
}

export function LandingJlptSelector({
  selectedLevel,
  onSelectLevel,
  handleSelectLevel,
}: LandingJlptSelectorProps) {
  const selectLevel = handleSelectLevel ?? onSelectLevel ?? (() => {})

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        Chọn cấp độ JLPT mục tiêu
      </span>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <JlptLevelButton
          label="Tất cả"
          isSelected={selectedLevel === "ALL"}
          onClick={() => selectLevel("ALL")}
        />
        {JLPT_LEVELS.map((level) => (
          <JlptLevelButton
            key={level}
            label={level}
            isSelected={selectedLevel === level}
            onClick={() => selectLevel(level)}
          />
        ))}
      </div>
    </div>
  )
}
