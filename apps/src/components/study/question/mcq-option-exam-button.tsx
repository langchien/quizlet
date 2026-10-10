"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface McqOptionExamButtonProps {
  opt: string
  label: string
  isSelected: boolean
  disabled: boolean
  onClick: () => void
}

export function McqOptionExamButton({
  opt,
  label,
  isSelected,
  disabled,
  onClick,
}: McqOptionExamButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition-all duration-150",
        isSelected
          ? "border-purple-600 bg-purple-500/10 font-bold text-purple-700 shadow-xs ring-1 ring-purple-600 dark:text-purple-300"
          : "border-border bg-background hover:bg-muted/50 text-foreground hover:border-purple-400"
      )}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold",
          isSelected
            ? "bg-purple-600 text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        {label}
      </span>
      <span className="flex-1 leading-snug">{opt}</span>
    </button>
  )
}
