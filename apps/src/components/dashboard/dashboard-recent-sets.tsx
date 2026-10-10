"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, ArrowRight } from "lucide-react"
import { useRecentSets } from "@/hooks/dashboard"
import type { RecentSetItem } from "@/types/dashboard"
import { RecentSetCard } from "./recent-set-card"
import { RecentSetsEmpty } from "./recent-sets-empty"

export interface DashboardRecentSetsProps {
  recentSets: RecentSetItem[]
}

export function DashboardRecentSets({
  recentSets: initialSets,
}: DashboardRecentSetsProps) {
  const { sets, hasSets } = useRecentSets({ recentSets: initialSets })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
            <BookOpen className="size-4 text-emerald-500" />
            <span>Bộ thẻ học tập của bạn</span>
          </h2>
          <p className="text-muted-foreground text-xs">
            Truy cập nhanh các bộ thẻ bạn đã tạo
          </p>
        </div>
        <Link
          href="/library"
          className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline"
        >
          <span>Vào Thư viện</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {hasSets ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => (
            <RecentSetCard key={set.id} set={set} />
          ))}
        </div>
      ) : (
        <RecentSetsEmpty />
      )}
    </div>
  )
}
