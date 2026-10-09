"use client"

import * as React from "react"
import Link from "next/link"
import { Sparkles, Flame, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardWelcomeBannerProps {
  userName: string
  currentStreak?: number
}

export function DashboardWelcomeBanner({
  userName,
  currentStreak = 0,
}: DashboardWelcomeBannerProps) {
  // Lời chào theo buổi trong ngày
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Chào buổi sáng"
    if (hour < 18) return "Chào buổi chiều"
    return "Chào buổi tối"
  }

  return (
    <div className="border-border from-primary/10 via-card to-card relative overflow-hidden rounded-3xl border bg-gradient-to-r p-6 shadow-xs sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-primary/15 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
              <Sparkles className="size-3.5" />
              <span>Lộ trình học tập cá nhân</span>
            </div>

            {currentStreak > 0 && (
              <div className="inline-flex animate-pulse items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Flame className="size-3.5 fill-current" />
                <span>Chuỗi {currentStreak} ngày liên tiếp! 🔥</span>
              </div>
            )}
          </div>

          <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
            {getGreeting()}, {userName || "Bạn"}! 👋
          </h1>
          <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
            Kiên trì ôn tập Spaced Repetition mỗi ngày giúp tăng 300% hiệu quả
            ghi nhớ từ vựng và chữ Hán.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/calendar">
            <Button variant="outline" className="gap-2 rounded-xl text-xs">
              <Clock className="size-3.5" />
              <span>Xem lịch ôn tập</span>
            </Button>
          </Link>

          <Link href="/library">
            <Button className="gap-2 rounded-xl text-xs shadow-xs">
              <Plus className="size-3.5" />
              <span>Tạo bộ thẻ mới</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
