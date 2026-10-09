"use client"

import * as React from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LearnMcqOptionsProps {
  options?: string[]
  correctAnswer: string
  selectedOption: string | null
  showFeedback: boolean
  onSelect: (option: string, isCorrect: boolean) => void
}

export function LearnMcqOptions({
  options,
  correctAnswer,
  selectedOption,
  showFeedback,
  onSelect,
}: LearnMcqOptionsProps) {
  if (!options || options.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((opt, idx) => {
        const isChosen = selectedOption === opt
        const isCorrectOpt = opt === correctAnswer

        let style =
          "border-border bg-background hover:border-primary/50 hover:bg-muted/50 text-foreground"
        if (showFeedback) {
          if (isCorrectOpt) {
            style =
              "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
          } else if (isChosen && !isCorrectOpt) {
            style =
              "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          } else {
            style = "opacity-40 border-border bg-background"
          }
        }

        return (
          <button
            key={idx}
            type="button"
            disabled={showFeedback}
            onClick={() => onSelect(opt, isCorrectOpt)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition-all duration-150",
              style
            )}
          >
            <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold">
              {idx + 1}
            </span>
            <span className="flex-1 leading-snug">{opt}</span>
            {showFeedback && isCorrectOpt && (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            )}
            {showFeedback && isChosen && !isCorrectOpt && (
              <XCircle className="size-4 shrink-0 text-rose-500" />
            )}
          </button>
        )
      })}
    </div>
  )
}
