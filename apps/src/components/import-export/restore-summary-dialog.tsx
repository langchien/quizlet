"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import type { RestoreSummaryResult } from "@/hooks/import-export/use-backup-restore"

interface RestoreSummaryViewProps {
  summary: RestoreSummaryResult | null
  className?: string
}

export function RestoreSummaryView({
  summary,
  className = "",
}: RestoreSummaryViewProps) {
  if (!summary) return null

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-200 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-sm font-bold">
        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
        <span>Kết quả phục hồi dữ liệu:</span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1 font-mono sm:grid-cols-3">
        <div>• Thư mục: {summary.restoredFoldersCount}</div>
        <div>• Bộ thẻ: {summary.restoredSetsCount}</div>
        <div>• Thẻ học: {summary.restoredCardsCount}</div>
        <div>• Nhãn: {summary.restoredTagsCount}</div>
        <div>• Phiên học: {summary.restoredSessionsCount}</div>
        <div>• Thống kê ngày: {summary.restoredStatsCount}</div>
      </div>
    </div>
  )
}
