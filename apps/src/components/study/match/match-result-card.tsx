"use client"

import * as React from "react"
import { MatchResultHeader } from "./match-result-header"
import { MatchResultStats } from "./match-result-stats"
import { MatchResultActions } from "./match-result-actions"

interface MatchResultCardProps {
  setId: string
  secondsFormatted: string
  totalPairs: number
  penaltyCount: number
  personalBestSecs: number | null
  isNewRecord: boolean
  onRestart: () => void
}

export function MatchResultCard({
  setId,
  secondsFormatted,
  totalPairs,
  penaltyCount,
  personalBestSecs,
  isNewRecord,
  onRestart,
}: MatchResultCardProps) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-3xl border p-6 text-center shadow-xl sm:p-8">
      <MatchResultHeader isNewRecord={isNewRecord} totalPairs={totalPairs} />

      <MatchResultStats
        secondsFormatted={secondsFormatted}
        totalPairs={totalPairs}
        penaltyCount={penaltyCount}
        personalBestSecs={personalBestSecs}
      />

      <MatchResultActions setId={setId} onRestart={onRestart} />
    </div>
  )
}
