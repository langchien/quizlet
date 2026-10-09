"use client"

import * as React from "react"
import Link from "next/link"
import { Calendar as CalendarIcon, BookOpen } from "lucide-react"

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <CalendarIcon className="size-6 text-emerald-500" />
          <span>Lịch ôn tập Spaced Repetition</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Lịch trình dự báo số lượng thẻ cần ôn tập mỗi ngày theo thuật toán lặp
          lại ngắt quãng.
        </p>
      </div>

      <div className="border-border bg-card/40 flex flex-col items-center justify-center rounded-3xl border border-dashed p-12 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-2xs">
          <CalendarIcon className="size-7" />
        </div>
        <h3 className="text-foreground text-lg font-bold">
          Lịch ôn tập sẽ được kích hoạt ở Phase 5
        </h3>
        <p className="text-muted-foreground mt-1.5 max-w-md text-xs leading-relaxed">
          Tính năng dự báo thẻ đến hạn (Due Cards Forecast) và lịch học 30 ngày
          sẽ sẵn sàng sau khi hoàn thiện SRS Engine ở Phase 3 & 4.
        </p>
        <Link
          href="/library"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
        >
          <BookOpen className="size-4" />
          <span>Ôn tập qua Thư viện bộ thẻ</span>
        </Link>
      </div>
    </div>
  )
}
