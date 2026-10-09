"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, ArrowRight, Plus, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { RecentSetItem } from "@/types/dashboard"

interface DashboardRecentSetsProps {
  recentSets: RecentSetItem[]
}

export function DashboardRecentSets({ recentSets }: DashboardRecentSetsProps) {
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

      {recentSets.length === 0 ? (
        <div className="border-border rounded-2xl border border-dashed py-10 text-center">
          <BookOpen className="text-muted-foreground mx-auto mb-2 size-8 opacity-40" />
          <p className="text-muted-foreground text-xs">
            Bạn chưa có bộ thẻ nào. Hãy tạo bộ thẻ đầu tiên để bắt đầu học!
          </p>
          <Link href="/library" className="mt-3 inline-block">
            <Button size="sm" className="gap-1.5 rounded-xl text-xs">
              <Plus className="size-3.5" />
              <span>Tạo bộ thẻ ngay</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentSets.map((set) => (
            <Link
              key={set.id}
              href={`/sets/${set.id}`}
              className="group border-border bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-md"
            >
              <div>
                {set.folder && (
                  <span className="mb-1.5 inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-500">
                    📁 {set.folder.name}
                  </span>
                )}
                <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-sm font-bold transition-colors">
                  {set.name}
                </h3>
                {set.description && (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                    {set.description}
                  </p>
                )}
              </div>

              <div className="border-border/50 mt-4 flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-foreground font-semibold">
                  {set.cardCount} thẻ
                </span>
                <span className="text-primary inline-flex items-center gap-1 text-[11px] font-semibold transition-transform group-hover:translate-x-0.5">
                  <span>Học ngay</span>
                  <Play className="size-2.5 fill-current" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
