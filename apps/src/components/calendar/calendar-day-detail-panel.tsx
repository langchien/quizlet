"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, CheckCircle2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  SRS_STATUS_BADGES,
  type MonthDueData,
  type TodayDueData,
} from "@/types/calendar"

interface CalendarDayDetailPanelProps {
  selectedDateStr: string
  isSelectedToday: boolean
  todayData: TodayDueData
  selectedDayDueInfo?: NonNullable<MonthDueData>["days"][number]
}

export function CalendarDayDetailPanel({
  selectedDateStr,
  isSelectedToday,
  todayData,
  selectedDayDueInfo,
}: CalendarDayDetailPanelProps) {
  const totalDue = isSelectedToday
    ? (todayData?.totalDue ?? 0)
    : (selectedDayDueInfo?.dueCount ?? 0)

  const overdueCount = isSelectedToday ? (todayData?.overdueCount ?? 0) : 0

  return (
    <div className="border-border bg-card flex flex-col justify-between rounded-3xl border p-6 shadow-2xs">
      <div className="flex flex-col gap-4">
        <div className="border-border/50 flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
              <BookOpen className="text-primary size-4" />
              <span>Chi tiết ngày ôn tập</span>
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Ngày {selectedDateStr} {isSelectedToday && "(Hôm nay)"}
            </p>
          </div>

          {isSelectedToday && (
            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold text-emerald-500">
              Hôm nay
            </Badge>
          )}
        </div>

        {/* Thông số ngày được chọn */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 border-border/50 rounded-2xl border p-3">
            <span className="text-muted-foreground text-[11px] font-medium">
              Tổng thẻ đến hạn
            </span>
            <div className="text-foreground mt-1 text-xl font-black">
              {totalDue}
            </div>
          </div>

          <div className="bg-muted/30 border-border/50 rounded-2xl border p-3">
            <span className="text-muted-foreground text-[11px] font-medium">
              Quá hạn ôn
            </span>
            <div className="mt-1 text-xl font-black text-rose-500">
              {overdueCount}
            </div>
          </div>
        </div>

        {/* Danh sách thẻ chi tiết nếu là hôm nay */}
        <div className="mt-2 flex flex-col gap-2">
          <span className="text-foreground text-xs font-bold">
            Danh sách thẻ cần ôn:
          </span>

          {isSelectedToday && todayData?.cards && todayData.cards.length > 0 ? (
            <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1">
              {todayData.cards.map((card) => {
                const statusMeta = SRS_STATUS_BADGES[card.status] || {
                  label: card.status,
                  className: "bg-muted text-muted-foreground",
                }

                return (
                  <div
                    key={card.id}
                    className="border-border/60 bg-muted/20 hover:bg-muted/40 rounded-2xl border p-3 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground text-sm font-bold">
                            {card.term}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            ({card.reading})
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                          {card.definition}
                        </p>
                      </div>

                      <span
                        className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="text-muted-foreground border-border/30 mt-2 flex items-center justify-between border-t pt-1.5 text-[10px]">
                      <span>📁 {card.studySet?.name}</span>
                      <span>
                        Trạng thái:{" "}
                        {card.isOverdue ? "Quá hạn" : "Đến hạn hôm nay"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="border-border/60 bg-muted/10 rounded-2xl border border-dashed py-10 text-center">
              <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-500 opacity-60" />
              <p className="text-muted-foreground text-xs font-medium">
                Không có thẻ nào cần ôn tập vào ngày này.
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                Hệ thống sẽ nhắc nhở khi đến chu kỳ lặp lại tiếp theo!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Nút Ôn tập */}
      <div className="border-border/50 mt-4 border-t pt-4">
        {isSelectedToday && todayData && todayData.totalDue > 0 ? (
          <Link href="/study/mistakes" className="w-full">
            <Button className="w-full gap-2 rounded-2xl bg-emerald-600 py-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700">
              <Play className="size-4 fill-current" />
              <span>Bắt đầu phiên ôn tập ngay</span>
            </Button>
          </Link>
        ) : (
          <Link href="/library" className="w-full">
            <Button
              variant="outline"
              className="w-full gap-2 rounded-2xl py-5 text-xs"
            >
              <BookOpen className="size-4" />
              <span>Khám phá các bộ thẻ khác</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
