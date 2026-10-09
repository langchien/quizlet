"use client"

import * as React from "react"
import Link from "next/link"
import { BarChart3, BookOpen } from "lucide-react"

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <BarChart3 className="size-6 text-rose-500" />
          <span>Thống kê tiến độ học tập</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Phân tích chuyên sâu thời gian học, độ chính xác, chuỗi Streak và biểu
          đồ Heatmap 365 ngày.
        </p>
      </div>

      <div className="border-border bg-card/40 flex flex-col items-center justify-center rounded-3xl border border-dashed p-12 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 shadow-2xs">
          <BarChart3 className="size-7" />
        </div>
        <h3 className="text-foreground text-lg font-bold">
          Báo cáo thống kê sẽ được kích hoạt ở Phase 5
        </h3>
        <p className="text-muted-foreground mt-1.5 max-w-md text-xs leading-relaxed">
          Biểu đồ Recharts, Heatmap 365 ngày kiểu GitHub và phân tích trạng thái
          ghi nhớ SRS đang được chuẩn bị.
        </p>
        <Link
          href="/library"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
        >
          <BookOpen className="size-4" />
          <span>Trở về Thư viện bộ thẻ</span>
        </Link>
      </div>
    </div>
  )
}
