"use client"

import * as React from "react"
import Link from "next/link"
import { Calendar as CalendarIcon, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarHeaderProps {
  todayDueCount?: number
}

export function CalendarHeader({ todayDueCount = 0 }: CalendarHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
          <CalendarIcon className="size-7 text-emerald-500" />
          <span>Lịch ôn tập Spaced Repetition</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
          Kế hoạch ôn tập thông minh dự báo thời điểm thẻ từ vựng đến hạn ghi
          nhớ.
        </p>
      </div>

      {todayDueCount > 0 && (
        <Button
          render={<Link href="/study/mistakes" />}
          className="gap-2 rounded-xl bg-emerald-600 text-xs text-white shadow-xs hover:bg-emerald-700"
        >
          <RotateCcw className="size-4" />
          <span>Ôn tập {todayDueCount} thẻ hôm nay</span>
        </Button>
      )}
    </div>
  )
}
