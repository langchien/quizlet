"use client"

import * as React from "react"
import Link from "next/link"
import { History, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { STUDY_MODE_LABELS, type DashboardStats } from "@/types/dashboard"

interface DashboardRecentSessionsProps {
  sessions?: DashboardStats["recentSessions"]
}

export function DashboardRecentSessions({
  sessions,
}: DashboardRecentSessionsProps) {
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

      {sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const modeMeta = STUDY_MODE_LABELS[session.mode] || {
              label: session.mode,
              icon: "📚",
            }
            const formattedDate = new Date(
              session.startedAt
            ).toLocaleDateString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
            })

            return (
              <div
                key={session.id}
                className="border-border bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-4 shadow-2xs transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{modeMeta.icon}</span>
                    <div>
                      <h4 className="text-foreground text-xs font-bold">
                        {modeMeta.label}
                      </h4>
                      <p className="text-muted-foreground max-w-[150px] truncate text-[11px]">
                        {session.studySet?.name || "Luyện tập tự do"}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      session.score >= 80
                        ? "default"
                        : session.score >= 50
                          ? "secondary"
                          : "outline"
                    }
                    className="px-2 py-0.5 text-[10px] font-bold"
                  >
                    {Math.round(session.score)}%
                  </Badge>
                </div>

                <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2.5 text-[11px]">
                  <span>{formattedDate}</span>
                  <span>
                    {session.correctCards}/{session.totalCards} thẻ •{" "}
                    {Math.round(session.duration / 60)} phút
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="border-border bg-card/40 rounded-2xl border border-dashed py-8 text-center">
          <History className="text-muted-foreground mx-auto mb-2 size-6 opacity-40" />
          <p className="text-muted-foreground text-xs">
            Chưa có phiên học nào được ghi lại.
          </p>
        </div>
      )}
    </div>
  )
}
