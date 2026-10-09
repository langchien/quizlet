"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LearnTfOptionsProps {
  displayedAnswer?: string
  isTrue?: boolean
  showFeedback: boolean
  onSelect: (choice: string, isCorrect: boolean) => void
}

export function LearnTfOptions({
  displayedAnswer,
  isTrue,
  showFeedback,
  onSelect,
}: LearnTfOptionsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-border/60 bg-muted/30 rounded-2xl border p-4 text-center">
        <span className="text-muted-foreground text-xs">
          Có phải có nghĩa là:
        </span>
        <div className="text-foreground mt-1 text-xl font-bold">
          {displayedAnswer}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          size="lg"
          disabled={showFeedback}
          onClick={() => {
            const isCorrectAnswer = isTrue === false
            onSelect("false", isCorrectAnswer)
          }}
          className={cn(
            "h-14 gap-2 rounded-2xl border-rose-500/30 text-base font-bold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
            showFeedback &&
              !isTrue &&
              "border-emerald-500 bg-emerald-500/10 text-emerald-600"
          )}
        >
          <X className="size-5" />
          <span>Sai ❌</span>
        </Button>

        <Button
          size="lg"
          disabled={showFeedback}
          onClick={() => {
            const isCorrectAnswer = isTrue === true
            onSelect("true", isCorrectAnswer)
          }}
          className={cn(
            "h-14 gap-2 rounded-2xl bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700",
            showFeedback && isTrue && "bg-emerald-600"
          )}
        >
          <Check className="size-5" />
          <span>Đúng ✅</span>
        </Button>
      </div>
    </div>
  )
}
