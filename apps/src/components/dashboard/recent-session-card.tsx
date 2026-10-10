"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import type { FormattedRecentSession } from "@/hooks/dashboard"

export interface RecentSessionCardProps {
  session: FormattedRecentSession
}

export function RecentSessionCard({ session }: RecentSessionCardProps) {
  return (
    <div className="border-border bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-4 shadow-2xs transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{session.modeIcon}</span>
          <div>
            <h4 className="text-foreground text-xs font-bold">
              {session.modeLabel}
            </h4>
            <p className="text-muted-foreground max-w-[150px] truncate text-[11px]">
              {session.setName}
            </p>
          </div>
        </div>

        <Badge
          variant={session.scoreVariant}
          className="px-2 py-0.5 text-[10px] font-bold"
        >
          {session.score}%
        </Badge>
      </div>

      <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2.5 text-[11px]">
        <span>{session.formattedDate}</span>
        <span>
          {session.correctCards}/{session.totalCards} thẻ •{" "}
          {session.durationMinutes} phút
        </span>
      </div>
    </div>
  )
}
