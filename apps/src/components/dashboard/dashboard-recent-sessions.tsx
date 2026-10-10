"use client"

import * as React from "react"
import Link from "next/link"
import { History, ArrowRight } from "lucide-react"
import { useRecentSessions } from "@/hooks/dashboard"
import type { DashboardStats } from "@/types/dashboard"
import { RecentSessionCard } from "./recent-session-card"
import { RecentSessionsEmpty } from "./recent-sessions-empty"

export interface DashboardRecentSessionsProps {
  sessions?: DashboardStats["recentSessions"]
}

export function DashboardRecentSessions({
  sessions: initialSessions,
}: DashboardRecentSessionsProps) {
  const { sessions, hasSessions } = useRecentSessions({
    sessions: initialSessions,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
            <History className="text-primary size-4" />
            <span>Phiên học gần đây</span>
          </h2>
          <p className="text-muted-foreground text-xs">
            Lịch sử các lần làm bài và luyện tập gần nhất
          </p>
        </div>
        <Link
          href="/stats"
          className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline"
        >
          <span>Toàn bộ lịch sử</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {hasSessions ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <RecentSessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <RecentSessionsEmpty />
      )}
    </div>
  )
}
