"use client"

import * as React from "react"
import { History } from "lucide-react"
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export function RecentSessionsEmpty() {
  return (
    <Empty className="border-border bg-card/40 rounded-2xl border border-dashed py-8">
      <EmptyMedia>
        <History className="text-muted-foreground size-6 opacity-40" />
      </EmptyMedia>
      <EmptyTitle className="text-muted-foreground text-xs font-normal">
        Chưa có phiên học nào được ghi lại.
      </EmptyTitle>
    </Empty>
  )
}
