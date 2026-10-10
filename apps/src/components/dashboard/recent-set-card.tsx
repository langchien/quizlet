"use client"

import * as React from "react"
import Link from "next/link"
import { Play } from "lucide-react"
import type { RecentSetItem } from "@/types/dashboard"

export interface RecentSetCardProps {
  set: RecentSetItem
}

export function RecentSetCard({ set }: RecentSetCardProps) {
  return (
    <Link
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
  )
}
