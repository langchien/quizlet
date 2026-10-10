"use client"

import * as React from "react"
import { STUDY_MODE_LABELS, type DashboardStats } from "@/types/dashboard"

export interface FormattedRecentSession {
  id: string
  mode: string
  modeLabel: string
  modeIcon: string
  setName: string
  score: number
  scoreVariant: "default" | "secondary" | "outline"
  formattedDate: string
  correctCards: number
  totalCards: number
  durationMinutes: number
}

export interface UseRecentSessionsProps {
  sessions?: DashboardStats["recentSessions"]
}

/**
 * Hook format dữ liệu các phiên học gần đây phục vụ hiển thị
 */
export function useRecentSessions({ sessions }: UseRecentSessionsProps) {
  const formattedSessions = React.useMemo<FormattedRecentSession[]>(() => {
    if (!sessions || sessions.length === 0) return []

    return sessions.map((session) => {
      const modeMeta = STUDY_MODE_LABELS[session.mode] || {
        label: session.mode,
        icon: "📚",
      }

      const formattedDate = new Date(session.startedAt).toLocaleDateString(
        "vi-VN",
        {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
        }
      )

      const scoreVariant: "default" | "secondary" | "outline" =
        session.score >= 80
          ? "default"
          : session.score >= 50
            ? "secondary"
            : "outline"

      return {
        id: session.id,
        mode: session.mode,
        modeLabel: modeMeta.label,
        modeIcon: modeMeta.icon,
        setName: session.studySet?.name || "Luyện tập tự do",
        score: Math.round(session.score),
        scoreVariant,
        formattedDate,
        correctCards: session.correctCards,
        totalCards: session.totalCards,
        durationMinutes: Math.round(session.duration / 60),
      }
    })
  }, [sessions])

  const hasSessions = formattedSessions.length > 0

  return {
    sessions: formattedSessions,
    hasSessions,
  }
}
