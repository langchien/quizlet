"use client"

import * as React from "react"
import { StudySummaryHeader } from "./study-summary-header"
import { StudySummaryMetricCard } from "./study-summary-metric-card"
import { StudySummaryActions } from "./study-summary-actions"

export interface StudySummaryProps {
  setId?: string
  setName?: string
  mode: string
  totalCards: number
  correctCards: number
  incorrectCards: number
  durationSeconds: number
  onRestart: () => void
  onReviewMistakes?: () => void
  hasMistakes?: boolean
}

export function StudySummary({
  setId,
  setName,
  mode,
  totalCards,
  correctCards,
  incorrectCards,
  durationSeconds,
  onRestart,
  onReviewMistakes,
  hasMistakes = false,
}: StudySummaryProps) {
  const accuracy =
    totalCards > 0 ? Math.round((correctCards / totalCards) * 100) : 0

  return (
    <div className="animate-in fade-in zoom-in-95 mx-auto max-w-xl duration-300">
      <div className="border-border bg-card overflow-hidden rounded-3xl border p-6 text-center shadow-lg sm:p-8">
        <StudySummaryHeader accuracy={accuracy} setName={setName} mode={mode} />

        <StudySummaryMetricCard
          accuracy={accuracy}
          correctCards={correctCards}
          incorrectCards={incorrectCards}
          durationSeconds={durationSeconds}
        />

        <StudySummaryActions
          hasMistakes={hasMistakes}
          incorrectCards={incorrectCards}
          onReviewMistakes={onReviewMistakes}
          onRestart={onRestart}
          setId={setId}
        />
      </div>
    </div>
  )
}
