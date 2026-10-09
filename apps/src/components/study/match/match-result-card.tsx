"use client"

import * as React from "react"
import Link from "next/link"
import { Trophy, Flame, Zap, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MatchResultCardProps {
  setId: string
  secondsFormatted: string
  totalPairs: number
  penaltyCount: number
  personalBestSecs: number | null
  isNewRecord: boolean
  onRestart: () => void
}

export function MatchResultCard({
  setId,
  secondsFormatted,
  totalPairs,
  penaltyCount,
  personalBestSecs,
  isNewRecord,
  onRestart,
}: MatchResultCardProps) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-3xl border p-6 text-center shadow-xl sm:p-8">
      {/* Trophy Badge Icon */}
      <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white shadow-xl">
        <Trophy className="size-10" />
      </div>

      {isNewRecord ? (
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-4 py-1 text-xs font-black text-amber-600 dark:text-amber-400">
          <Flame className="size-4 fill-current text-amber-500" />
          <span>KỶ LỤC MỚI CỦA BẠN! 🎉</span>
        </div>
      ) : (
        <span className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600">
          Hoàn thành xuất sắc!
        </span>
      )}

      <h1 className="text-foreground mt-2 text-3xl font-black sm:text-4xl">
        Ghép đôi thành công!
      </h1>
      <p className="text-muted-foreground mt-1 text-xs font-medium">
        Bạn đã ghép đúng toàn bộ {totalPairs} cặp từ vựng trong bộ thẻ.
      </p>

      {/* Big Time Metric Container */}
      <div className="border-border/60 from-muted/30 to-background my-6 rounded-2xl border bg-gradient-to-b p-6">
        <div className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          Thời gian hoàn thành
        </div>
        <div className="text-foreground mt-1 text-5xl font-black sm:text-6xl">
          {secondsFormatted}
          <span className="text-3xl text-rose-500 sm:text-4xl">s</span>
        </div>

        <div className="border-border/60 mt-6 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-muted-foreground text-xs font-medium">
              Số cặp đã ghép
            </div>
            <div className="text-foreground mt-0.5 text-lg font-bold">
              {totalPairs} cặp
            </div>
          </div>

          <div className="text-center">
            <div className="text-muted-foreground text-xs font-medium">
              Số lần phạt (+1s)
            </div>
            <div className="mt-0.5 text-lg font-bold text-rose-500">
              {penaltyCount} lần
            </div>
          </div>

          <div className="col-span-2 text-center sm:col-span-1">
            <div className="text-muted-foreground text-xs font-medium">
              Kỷ lục cá nhân (PB)
            </div>
            <div className="text-foreground mt-0.5 text-lg font-bold">
              {personalBestSecs !== null ? `${personalBestSecs}s` : "--"}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={onRestart}
          className="gap-2 rounded-xl bg-rose-600 font-bold text-white shadow-xs hover:bg-rose-700"
        >
          <Zap className="size-4 fill-current" />
          <span>Chơi lại ván mới</span>
        </Button>

        <Link
          href={`/sets/${setId}`}
          className="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          <BookOpen className="size-4" />
          <span>Về bộ thẻ</span>
        </Link>
      </div>
    </div>
  )
}
