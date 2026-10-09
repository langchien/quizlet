"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { TestQuestion } from "@/hooks/study/use-test-engine"

interface TestNavPaletteProps {
  questions: TestQuestion[]
  activeQuestionIndex: number
  onSelectQuestion: (idx: number) => void
  progressPct: number
}

export function TestNavPalette({
  questions,
  activeQuestionIndex,
  onSelectQuestion,
  progressPct,
}: TestNavPaletteProps) {
  return (
    <div className="border-border bg-card/50 overflow-hidden rounded-2xl border p-3 shadow-2xs">
      <div className="text-muted-foreground mb-2 flex items-center justify-between text-[11px] font-bold">
        <span>Danh sách câu hỏi</span>
        <span>{progressPct}% hoàn thành</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {questions.map((item, idx) => {
          const isCurrent = idx === activeQuestionIndex
          const isAnswered =
            item.userAnswer !== undefined && item.userAnswer.trim() !== ""

          let style =
            "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
          if (isAnswered) {
            style =
              "border-purple-500/40 bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold"
          }
          if (isCurrent) {
            style =
              "border-purple-600 bg-purple-600 text-white font-black ring-2 ring-purple-600/30"
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={cn(
                "flex size-7.5 items-center justify-center rounded-lg border text-xs transition-all",
                style
              )}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
