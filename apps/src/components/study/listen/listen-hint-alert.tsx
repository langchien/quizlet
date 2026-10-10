"use client"

import * as React from "react"
import { Lightbulb } from "lucide-react"
import type { ListenCardItem } from "@/types/listen"

export interface ListenHintAlertProps {
  failedAttempts: number
  currentCard: ListenCardItem
}

export function ListenHintAlert({
  failedAttempts,
  currentCard,
}: ListenHintAlertProps) {
  if (failedAttempts <= 0) return null

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-2 rounded-2xl bg-amber-500/10 p-3.5 text-xs text-amber-600 dark:text-amber-400">
      <div className="flex items-center gap-2 font-bold">
        <Lightbulb className="size-4 shrink-0" />
        <span>Gợi ý:</span>
      </div>

      {failedAttempts === 1 && (
        <p>
          Từ này bắt đầu bằng ký tự: &quot;
          <b>{currentCard.term.charAt(0)}</b>&quot; (Gồm{" "}
          {currentCard.term.length} ký tự)
        </p>
      )}

      {failedAttempts >= 2 && (
        <div className="flex flex-col gap-1">
          <p>
            Cách đọc Hiragana: <b>{currentCard.reading}</b>
          </p>
          <p>
            Ý nghĩa tiếng Việt: <i>{currentCard.definition}</i>
          </p>
        </div>
      )}
    </div>
  )
}
