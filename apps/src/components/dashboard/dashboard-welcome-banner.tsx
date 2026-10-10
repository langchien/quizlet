"use client"

import * as React from "react"
import { useDashboardWelcome } from "@/hooks/dashboard"
import { WelcomeBannerHeader } from "./welcome-banner-header"
import { WelcomeBannerActions } from "./welcome-banner-actions"

export interface DashboardWelcomeBannerProps {
  userName: string
  currentStreak?: number
}

export function DashboardWelcomeBanner({
  userName,
  currentStreak = 0,
}: DashboardWelcomeBannerProps) {
  const { greeting, displayName, hasStreak } = useDashboardWelcome({
    userName,
    currentStreak,
  })

  return (
    <div className="border-border from-primary/10 via-card to-card relative overflow-hidden rounded-3xl border bg-gradient-to-r p-6 shadow-xs sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <WelcomeBannerHeader
          greeting={greeting}
          displayName={displayName}
          currentStreak={currentStreak}
          hasStreak={hasStreak}
        />
        <WelcomeBannerActions />
      </div>
    </div>
  )
}
