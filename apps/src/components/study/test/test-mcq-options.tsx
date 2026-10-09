"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TestMcqOptionsProps {
  options?: string[]
  userAnswer?: string
  onSelectOption: (ans: string) => void
}

export function TestMcqOptions({
  options,
  userAnswer,
  onSelectOption,
}: TestMcqOptionsProps) {
  if (!options || options.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((opt, optIdx) => {
        const isSelected = userAnswer === opt

        return (
          <button
            key={optIdx}
            type="button"
            onClick={() => onSelectOption(opt)}
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
              {String.fromCharCode(65 + optIdx)}
            </span>
            <span className="flex-1 leading-snug">{opt}</span>
          </button>
        )
      })}
    </div>
  )
}
