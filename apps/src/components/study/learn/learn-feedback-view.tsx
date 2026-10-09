"use client"

import * as React from "react"
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LearnFeedbackViewProps {
  isCorrect: boolean
  correctAnswer: string
  reading?: string | null
  example?: string | null
  onNext: () => void
}

export function LearnFeedbackView({
  isCorrect,
  correctAnswer,
  reading,
  example,
  onNext,
}: LearnFeedbackViewProps) {
  return (
    <div className="border-border/80 bg-muted/60 animate-in fade-in-0 mt-6 rounded-2xl border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          {isCorrect ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
          ) : (
            <XCircle className="mt-0.5 size-5 shrink-0 text-rose-500" />
          )}
          <div>
            <div className="text-foreground text-sm font-bold">
              {isCorrect ? "Chính xác! Làm tốt lắm!" : "Chưa đúng rồi!"}
            </div>
            {!isCorrect && (
              <div className="text-muted-foreground mt-0.5 text-xs">
                Đáp án đúng là:{" "}
                <span className="text-foreground font-bold">
                  {correctAnswer}
                  {reading && reading !== correctAnswer ? ` (${reading})` : ""}
                </span>
              </div>
            )}
            {example && (
              <div className="text-muted-foreground font-japanese mt-1 text-xs italic">
                Ví dụ: {example}
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onNext}
          className="gap-1.5 self-end rounded-xl font-bold sm:self-center"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
