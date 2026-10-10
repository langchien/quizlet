"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, RotateCcw, BookOpen, ArrowRight } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface StudySummaryActionsProps {
  hasMistakes?: boolean
  incorrectCards: number
  onReviewMistakes?: () => void
  onRestart: () => void
  setId?: string
}

export function StudySummaryActions({
  hasMistakes = false,
  incorrectCards,
  onReviewMistakes,
  onRestart,
  setId,
}: StudySummaryActionsProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
      {hasMistakes && onReviewMistakes && (
        <Button
          variant="default"
          onClick={onReviewMistakes}
          className="gap-2 bg-rose-600 text-white shadow-xs hover:bg-rose-700"
        >
          <AlertCircle className="size-4" />
          <span>Ôn lại {incorrectCards} thẻ sai</span>
        </Button>
      )}

      <Button variant="outline" onClick={onRestart} className="gap-2">
        <RotateCcw className="size-4" />
        <span>Học lại từ đầu</span>
      </Button>

      {setId ? (
        <Link
          href={`/sets/${setId}`}
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "gap-2 rounded-xl"
          )}
        >
          <BookOpen className="size-4" />
          <span>Về bộ thẻ</span>
        </Link>
      ) : (
        <Link
          href="/library"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "gap-2 rounded-xl"
          )}
        >
          <ArrowRight className="size-4" />
          <span>Thư viện</span>
        </Link>
      )}
    </div>
  )
}
