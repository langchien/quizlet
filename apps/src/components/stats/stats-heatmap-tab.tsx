"use client"

import * as React from "react"
import { Flame, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { HeatmapDataResponse } from "@/schemas/stats"

export const HEATMAP_YEARS = [
  { val: "recent", label: "365 ngày qua" },
  { val: "2026", label: "2026" },
  { val: "2025", label: "2025" },
] as const

interface StatsHeatmapHeaderProps {
  totalCards: number
  activeDays: number
  isPending: boolean
  year: string
  onYearChange: (year: string) => void
}

/**
 * Sub-component tiêu đề và bộ lọc năm cho biểu đồ Heatmap
 */
export function StatsHeatmapHeader({
  totalCards,
  activeDays,
  isPending,
  year,
  onYearChange,
}: StatsHeatmapHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
          <Flame className="size-4 text-amber-500" />
          <span>Biểu đồ hoạt động 365 ngày (Heatmap)</span>
          {isPending && (
            <Loader2 className="text-primary size-4 animate-spin" />
          )}
        </h3>
        <p className="text-muted-foreground text-xs">
          Tổng cộng {totalCards} thẻ đã ôn luyện trong {activeDays} ngày hoạt
          động
        </p>
      </div>

      <div className="bg-muted/50 border-border flex items-center gap-1.5 rounded-xl border p-1">
        {HEATMAP_YEARS.map((y) => (
          <Button
            key={y.val}
            variant={year === y.val ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onYearChange(y.val)}
            disabled={isPending}
            className="h-7 rounded-lg px-2.5 text-[11px]"
          >
            {y.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

interface StatsHeatmapLegendProps {
  hoveredCell: {
    date: string
    count: number
    timeSpent?: number
  } | null
}

/**
 * Sub-component thông tin tooltip hover và thang mức độ hoạt động
 */
export function StatsHeatmapLegend({ hoveredCell }: StatsHeatmapLegendProps) {
  return (
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
  )
}

export interface StatsHeatmapTabProps {
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
  const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-3xl border p-6 shadow-2xs">
      <StatsHeatmapHeader
        totalCards={totalHeatmapCards}
        activeDays={activeDaysCount}
        isPending={isHeatmapPending}
        year={heatmapYear}
        onYearChange={onYearChange}
      />

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

          {/* Các hàng thứ trong tuần (0 = CN đến 6 = T7) */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
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
                  bgClass = "bg-emerald-500/30 border-emerald-500/40"
                if (cell.level === 2)
                  bgClass = "bg-emerald-500/55 border-emerald-500/60"
                if (cell.level === 3)
                  bgClass = "bg-emerald-500/80 border-emerald-500/90"
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
          ))}
        </div>
      </div>

      <StatsHeatmapLegend hoveredCell={hoveredCell} />
    </div>
  )
}
