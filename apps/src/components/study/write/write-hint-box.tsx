"use client"

import * as React from "react"
import { Lightbulb } from "lucide-react"
import type { WriteCardItem, WriteStatus } from "@/types/write"

interface WriteHintBoxProps {
  failedAttempts: number
  status: WriteStatus
  currentCard: WriteCardItem
}

export function WriteHintBox({
  failedAttempts,
  status,
  currentCard,
}: WriteHintBoxProps) {
  if (failedAttempts === 0 || status !== "typing") {
    return null
  }

  return (
    <div className="mx-auto mb-4 flex max-w-md items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
      <Lightbulb className="size-4 shrink-0" />
      <div>
        {failedAttempts === 1 ? (
          <span>
            {currentCard.reading ? (
              <>
                Gợi ý cách đọc: <b>{currentCard.reading}</b>
              </>
            ) : (
              <>
                Gợi ý: Bắt đầu bằng chữ &quot;
                <b>{currentCard.term.charAt(0)}</b>&quot;
              </>
            )}
          </span>
        ) : (
          <span>
            Gợi ý từ vựng: <b>{currentCard.term}</b> ({currentCard.reading})
          </span>
        )}
      </div>
    </div>
  )
}
