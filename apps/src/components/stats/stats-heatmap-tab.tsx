"use client"

import * as React from "react"
import { Flame, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { HeatmapDataResponse } from "@/schemas/stats"

interface StatsHeatmapTabProps {
  heatmapYear: string
  isHeatmapPending: boolean
  onYearChange: (year: string) => void
  totalHeatmapCards: number
  activeDaysCount: number
  heatmapWeeks: HeatmapDataResponse[]
  hoveredCell: {
    date: string
    count: number
    timeSpent?: number
  } | null
  setHoveredCell: (
    cell: {
      date: string
      count: number
      timeSpent?: number
    } | null
  ) => void
}

export function StatsHeatmapTab({
  heatmapYear,
  isHeatmapPending,
  onYearChange,
  totalHeatmapCards,
  activeDaysCount,
  heatmapWeeks,
  hoveredCell,
  setHoveredCell,
}: StatsHeatmapTabProps) {
  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-3xl border p-6 shadow-2xs">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
            <Flame className="size-4 text-amber-500" />
            <span>Biểu đồ hoạt động 365 ngày (Heatmap)</span>
            {isHeatmapPending && (
              <Loader2 className="text-primary size-4 animate-spin" />
            )}
          </h3>
          <p className="text-muted-foreground text-xs">
            Tổng cộng {totalHeatmapCards} thẻ đã ôn luyện trong{" "}
            {activeDaysCount} ngày hoạt động
          </p>
        </div>

        {/* Bộ lọc chọn năm */}
        <div className="bg-muted/50 border-border flex items-center gap-1.5 rounded-xl border p-1">
          <Button
            variant={heatmapYear === "recent" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onYearChange("recent")}
            disabled={isHeatmapPending}
            className="h-7 rounded-lg px-2.5 text-[11px]"
          >
            365 ngày qua
          </Button>
          <Button
            variant={heatmapYear === "2026" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onYearChange("2026")}
            disabled={isHeatmapPending}
            className="h-7 rounded-lg px-2.5 text-[11px]"
          >
            2026
          </Button>
          <Button
            variant={heatmapYear === "2025" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onYearChange("2025")}
            disabled={isHeatmapPending}
            className="h-7 rounded-lg px-2.5 text-[11px]"
          >
            2025
          </Button>
        </div>
      </div>

      {/* Grid Heatmap cuộn ngang */}
      <div
        className={`overflow-x-auto pt-1 pb-2 transition-opacity ${isHeatmapPending ? "opacity-50" : ""}`}
      >
        <div className="inline-flex min-w-[750px] flex-col gap-1.5">
          {/* Header Tháng */}
          <div className="flex items-center gap-1.5">
            <div className="w-8" />
            {heatmapWeeks.map((_, weekIdx) => {
              const firstDayInWeek = heatmapWeeks[weekIdx][0]
              let monthLabel = ""
              if (firstDayInWeek?.date) {
                const d = new Date(firstDayInWeek.date)
                if (d.getDate() <= 7) {
                  monthLabel = `T${d.getMonth() + 1}`
                }
              }
              return (
                <div
                  key={weekIdx}
                  className="text-muted-foreground w-3 text-center text-[10px] font-semibold"
                >
                  {monthLabel}
                </div>
              )
            })}
          </div>

          {/* Các hàng thứ trong tuần */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
            const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
            return (
              <div key={dayOfWeek} className="flex items-center gap-1.5">
                <span className="text-muted-foreground w-8 text-[10px] font-medium">
                  {dayLabels[dayOfWeek]}
                </span>

                {heatmapWeeks.map((week, weekIdx) => {
                  const cell = week[dayOfWeek]
                  if (!cell || !cell.date) {
                    return (
                      <div
                        key={weekIdx}
                        className="size-3 rounded-[3px] opacity-0"
                      />
                    )
                  }

                  let bgClass = "bg-muted/40 border-border/40"
                  if (cell.level === 1)
                    bgClass =
                      "bg-emerald-500/30 dark:bg-emerald-500/30 border-emerald-500/40"
                  if (cell.level === 2)
                    bgClass =
                      "bg-emerald-500/55 dark:bg-emerald-500/55 border-emerald-500/60"
                  if (cell.level === 3)
                    bgClass =
                      "bg-emerald-500/80 dark:bg-emerald-500/80 border-emerald-500/90"
                  if (cell.level === 4)
                    bgClass =
                      "bg-emerald-500 text-white font-bold border-emerald-400"

                  return (
                    <div
                      key={weekIdx}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`size-3 cursor-pointer rounded-[3px] border transition-transform hover:scale-125 ${bgClass}`}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Chú giải cấp độ và Tooltip Hover */}
      <div className="border-border/50 flex flex-col justify-between gap-2 border-t pt-3 text-xs sm:flex-row sm:items-center">
        <div className="text-muted-foreground min-h-[16px] text-[11px]">
          {hoveredCell ? (
            <span className="text-foreground font-semibold">
              📅 Ngày {hoveredCell.date}:{" "}
              <span className="text-primary font-bold">
                {hoveredCell.count} thẻ
              </span>
              {hoveredCell.timeSpent !== undefined &&
                ` (${Math.round(hoveredCell.timeSpent / 60)} phút)`}
            </span>
          ) : (
            <span>Rê chuột vào từng ô để xem chi tiết ngày học</span>
          )}
        </div>

        <div className="text-muted-foreground flex items-center gap-1.5 self-end text-[11px] sm:self-auto">
          <span>Ít</span>
          <div className="bg-muted/40 border-border/40 size-2.5 rounded-[2px] border" />
          <div className="size-2.5 rounded-[2px] bg-emerald-500/30" />
          <div className="size-2.5 rounded-[2px] bg-emerald-500/55" />
          <div className="size-2.5 rounded-[2px] bg-emerald-500/80" />
          <div className="size-2.5 rounded-[2px] bg-emerald-500" />
          <span>Nhiều</span>
        </div>
      </div>
    </div>
  )
}
