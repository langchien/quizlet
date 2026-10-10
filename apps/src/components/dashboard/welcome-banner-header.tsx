"use client"

import * as React from "react"
import { Sparkles, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface WelcomeBannerHeaderProps {
  greeting: string
  displayName: string
  currentStreak?: number
  hasStreak?: boolean
}

export function WelcomeBannerHeader({
  greeting,
  displayName,
  currentStreak = 0,
  hasStreak = false,
}: WelcomeBannerHeaderProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-primary/15 text-primary border-transparent font-semibold"
        >
          <Sparkles data-icon="inline-start" className="size-3.5" />
          <span>Lộ trình học tập cá nhân</span>
        </Badge>

        {hasStreak && (
          <Badge variant="warning" className="animate-pulse font-bold">
            <Flame data-icon="inline-start" className="size-3.5 fill-current" />
            <span>Chuỗi {currentStreak} ngày liên tiếp! 🔥</span>
          </Badge>
        )}
      </div>

      <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
        {greeting}, {displayName}! 👋
      </h1>
      <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
        Kiên trì ôn tập Spaced Repetition mỗi ngày giúp tăng 300% hiệu quả ghi
        nhớ từ vựng và chữ Hán.
      </p>
    </div>
  )
}
