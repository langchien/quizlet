"use client"

import * as React from "react"
import { Sparkles, CheckCircle2, XCircle, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTTS } from "@/hooks/useTTS"
import type { TestQuestion } from "@/hooks/study/use-test-engine"

interface TestReviewListProps {
  questions: TestQuestion[]
}

export function TestReviewList({ questions }: TestReviewListProps) {
  const { speak } = useTTS()

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
        <Sparkles className="size-4 text-purple-600" />
        <span>Chi tiết từng câu hỏi ({questions.length})</span>
      </h2>

      <div className="flex flex-col gap-3">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className={cn(
              "border-border bg-card rounded-2xl border p-4 shadow-2xs transition-all",
              q.isCorrect ? "border-emerald-500/40" : "border-rose-500/40"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white",
                    q.isCorrect ? "bg-emerald-500" : "bg-rose-500"
                  )}
                >
                  {q.isCorrect ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <XCircle className="size-4" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-bold">
                      Câu {idx + 1}
                    </span>
                    <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">
                      {q.kind}
                    </span>
                  </div>

                  <div className="font-japanese text-foreground text-base font-bold">
                    {q.prompt} {q.subPrompt && `(${q.subPrompt})`}
                  </div>

                  <div className="text-xs">
                    <span className="text-muted-foreground">Bạn đã chọn: </span>
                    <span
                      className={cn(
                        "font-bold",
                        q.isCorrect ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {q.userAnswer || "(Bỏ trống)"}
                    </span>
                  </div>

                  {!q.isCorrect && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">
                        Đáp án đúng:{" "}
                      </span>
                      <span className="text-foreground font-bold">
                        {q.correctAnswer}
                        {q.card.reading && q.card.reading !== q.correctAnswer
                          ? ` (${q.card.reading})`
                          : ""}
                      </span>
                    </div>
                  )}

                  {q.card.example && (
                    <div className="bg-muted/40 font-japanese text-muted-foreground mt-2 rounded-lg p-2 text-xs italic">
                      Ví dụ: {q.card.example}
                      {q.card.exampleTranslation &&
                        ` (${q.card.exampleTranslation})`}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => speak(q.card.term)}
                className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-md p-1.5 transition-colors"
                title="Phát âm tiếng Nhật"
              >
                <Volume2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
