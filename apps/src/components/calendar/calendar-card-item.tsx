"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { SRS_STATUS_BADGES, type TodayDueData } from "@/types/calendar"

type DueCard = NonNullable<TodayDueData>["cards"][number]

interface CalendarCardItemProps {
  card: DueCard
}

export function CalendarCardItem({ card }: CalendarCardItemProps) {
  const statusMeta = SRS_STATUS_BADGES[card.status] || {
    label: card.status,
    className: "bg-muted text-muted-foreground",
  }

  return (
    <div className="border-border/60 bg-muted/20 hover:bg-muted/40 rounded-2xl border p-3 transition-colors">
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
          className={cn(
            "rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
            statusMeta.className
          )}
        >
          {statusMeta.label}
        </span>
      </div>

      <div className="text-muted-foreground border-border/30 mt-2 flex items-center justify-between border-t pt-1.5 text-[10px]">
        <span>📁 {card.studySet?.name}</span>
        <span>
          Trạng thái: {card.isOverdue ? "Quá hạn" : "Đến hạn hôm nay"}
        </span>
      </div>
    </div>
  )
}
