"use client"

import * as React from "react"

export interface UseDashboardWelcomeProps {
  userName?: string
  currentStreak?: number
}

/**
 * Hook xử lý logic lời chào theo thời gian và định dạng thông tin streak
 */
export function useDashboardWelcome({
  userName = "",
  currentStreak = 0,
}: UseDashboardWelcomeProps) {
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Chào buổi sáng"
    if (hour < 18) return "Chào buổi chiều"
    return "Chào buổi tối"
  }, [])

  const displayName = userName.trim() || "Bạn"
  const hasStreak = currentStreak > 0

  return {
    greeting,
    displayName,
    hasStreak,
    currentStreak,
  }
}
