"use client"

import * as React from "react"
import { ChevronLeft, ListChecks, Clock, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface TestRunnerHeaderProps {
  answeredCount: number
  totalQuestions: number
  timeLeftSeconds: number | null
  onRequestExit: () => void
  onRequestSubmit: () => void
}

function formatTimer(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s < 10 ? "0" : ""}${s}`
}

export function TestRunnerHeader({
  answeredCount,
  totalQuestions,
  timeLeftSeconds,
  onRequestExit,
  onRequestSubmit,
}: TestRunnerHeaderProps) {
  return (
    <div className="border-border bg-card/80 sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRequestExit}
          className="text-muted-foreground hover:text-foreground h-8 gap-1 px-2 text-xs"
        >
          <ChevronLeft className="size-4" />
          <span>Thoát</span>
        </Button>

        <div className="border-border/60 hidden h-4 w-px border-r sm:block" />

        {/* Answered Counter */}
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold">
          <ListChecks className="text-primary size-4" />
          <span>
            Đã làm:{" "}
            <b className="text-foreground">
              {answeredCount}/{totalQuestions}
            </b>
          </span>
        </div>
      </div>

      {/* Timer */}
      {timeLeftSeconds !== null && (
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold",
            timeLeftSeconds < 60
              ? "animate-pulse bg-rose-500/20 text-rose-600 dark:text-rose-400"
              : "bg-muted text-foreground"
          )}
        >
          <Clock className="size-3.5" />
          <span>{formatTimer(timeLeftSeconds)}</span>
        </div>
      )}

      {/* Submit Action Button */}
      <Button
        size="sm"
        onClick={onRequestSubmit}
        className="h-8 gap-1.5 rounded-xl bg-purple-600 px-4 font-bold text-white shadow-xs hover:bg-purple-700"
      >
        <span>Nộp bài</span>
        <CheckSquare className="size-3.5" />
      </Button>
    </div>
  )
}
