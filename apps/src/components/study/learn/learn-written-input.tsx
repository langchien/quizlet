"use client"

import * as React from "react"
import { Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { LearnCardItem } from "@/types/learn"

interface LearnWrittenInputProps {
  card: LearnCardItem
  correctAnswer: string
  writtenAnswer: string
  onWrittenAnswerChange: (value: string) => void
  failedAttempts: number
  showFeedback: boolean
  onSubmit: () => void
}

export function LearnWrittenInput({
  card,
  correctAnswer,
  writtenAnswer,
  onWrittenAnswerChange,
  failedAttempts,
  showFeedback,
  onSubmit,
}: LearnWrittenInputProps) {
  return (
    <div className="flex flex-col gap-4">
      {failedAttempts >= 1 && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
          <Lightbulb className="size-4 shrink-0" />
          <span>
            {card.reading ? (
              <>
                Gợi ý cách đọc: <b>{card.reading}</b>
              </>
            ) : (
              <>
                Gợi ý: Bắt đầu bằng chữ &quot;
                <b>{correctAnswer.charAt(0)}</b>&quot;
              </>
            )}
          </span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="Gõ từ tiếng Nhật (Kanji hoặc Hiragana)..."
          value={writtenAnswer}
          onChange={(e) => onWrittenAnswerChange(e.target.value)}
          disabled={showFeedback}
          autoFocus
          className="h-12 text-base font-semibold"
        />
        <Button
          type="submit"
          disabled={showFeedback || !writtenAnswer.trim()}
          className="h-12 px-6 font-bold"
        >
          Kiểm tra
        </Button>
      </form>
    </div>
  )
}
