"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TestTfOptionsProps {
  displayedAnswer?: string
  userAnswer?: string
  onSelectAnswer: (ans: string) => void
}

export function TestTfOptions({
  displayedAnswer,
  userAnswer,
  onSelectAnswer,
}: TestTfOptionsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-border/60 bg-muted/30 rounded-2xl border p-4 text-center">
        <span className="text-muted-foreground text-xs">
          Có phải mang ý nghĩa là:
        </span>
        <div className="text-foreground mt-1 text-xl font-bold">
          {displayedAnswer}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => onSelectAnswer("false")}
          className={cn(
            "h-14 rounded-2xl border-rose-500/30 text-base font-bold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
            userAnswer === "false" &&
              "border-rose-600 bg-rose-500/20 font-black text-rose-700 ring-2 ring-rose-500"
          )}
        >
          <span>Sai ❌</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => onSelectAnswer("true")}
          className={cn(
            "h-14 rounded-2xl border-emerald-500/30 text-base font-bold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400",
            userAnswer === "true" &&
              "border-emerald-600 bg-emerald-500/20 font-black text-emerald-700 ring-2 ring-emerald-500"
          )}
        >
          <span>Đúng ✅</span>
        </Button>
      </div>
    </div>
  )
}
