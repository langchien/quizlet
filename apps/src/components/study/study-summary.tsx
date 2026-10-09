"use client"

import * as React from "react"
import Link from "next/link"
import {
  Trophy,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export interface StudySummaryProps {
  setId?: string
  setName?: string
  mode: string
  totalCards: number
  correctCards: number
  incorrectCards: number
  durationSeconds: number
  onRestart: () => void
  onReviewMistakes?: () => void
  hasMistakes?: boolean
}

export function StudySummary({
  setId,
  setName,
  mode,
  totalCards,
  correctCards,
  incorrectCards,
  durationSeconds,
  onRestart,
  onReviewMistakes,
  hasMistakes = false,
}: StudySummaryProps) {
  const accuracy =
    totalCards > 0 ? Math.round((correctCards / totalCards) * 100) : 0

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    if (m === 0) return `${s} giây`
    return `${m}p ${s}s`
  }

  const getEncouragement = () => {
    if (accuracy === 100) return "Xuất sắc! Bạn đã ghi nhớ toàn bộ thẻ!"
    if (accuracy >= 80) return "Rất tốt! Bạn đang tiến bộ vượt bậc!"
    if (accuracy >= 50) return "Khá tốt! Hãy ôn lại các thẻ chưa thuộc nhé!"
    return "Đừng nản lòng! Luyện tập nhiều hơn sẽ giúp bạn ghi nhớ sâu!"
  }

  return (
    <div className="animate-in fade-in zoom-in-95 mx-auto max-w-xl duration-300">
      <div className="border-border bg-card overflow-hidden rounded-3xl border p-6 text-center shadow-lg sm:p-8">
        {/* Header Icon */}
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-white shadow-md">
          <Trophy className="size-8" />
        </div>

        <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
          Hoàn thành phiên học!
        </h2>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          {getEncouragement()}
        </p>

        {/* Set & Mode Info */}
        {(setName || mode) && (
          <div className="bg-muted/50 text-foreground/80 mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold">
            <Layers className="text-primary size-3.5" />
            <span>{setName || "Bộ thẻ học"}</span>
            <span>•</span>
            <span className="text-primary capitalize">{mode}</span>
          </div>
        )}

        {/* Score Ring / Big Metric */}
        <div className="border-border/60 from-muted/30 to-background my-6 rounded-2xl border bg-gradient-to-b p-6">
          <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Tỷ lệ ghi nhớ
          </div>
          <div className="text-foreground mt-1 text-5xl font-black sm:text-6xl">
            {accuracy}
            <span className="text-primary text-3xl sm:text-4xl">%</span>
          </div>

          <div className="border-border/60 mt-4 grid grid-cols-3 gap-2 border-t pt-4">
            <div className="text-center">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Đúng</span>
              </div>
              <div className="mt-0.5 text-lg font-bold text-emerald-500">
                {correctCards}
              </div>
            </div>

            <div className="text-center">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <XCircle className="size-3.5 text-rose-500" />
                <span>Sai</span>
              </div>
              <div className="mt-0.5 text-lg font-bold text-rose-500">
                {incorrectCards}
              </div>
            </div>

            <div className="text-center">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <Clock className="size-3.5 text-blue-500" />
                <span>Thời gian</span>
              </div>
              <div className="text-foreground mt-0.5 text-lg font-bold">
                {formatTime(durationSeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
              className="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            >
              <BookOpen className="size-4" />
              <span>Về bộ thẻ</span>
            </Link>
          ) : (
            <Link
              href="/library"
              className="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            >
              <ArrowRight className="size-4" />
              <span>Thư viện</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
