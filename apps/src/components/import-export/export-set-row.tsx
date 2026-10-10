"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"
import type { UserSetSummary } from "@/hooks/import-export/use-export-sets"

interface ExportSetRowProps {
  set: UserSetSummary
}

export function ExportSetRow({ set }: ExportSetRowProps) {
  return (
    <div className="hover:bg-muted/30 flex items-center justify-between p-3 text-xs transition-colors">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-foreground truncate font-semibold">
          {set.name}
        </span>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {set.cardCount} thẻ
        </Badge>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <a
          href={`/api/export/set/${set.id}?format=json`}
          download
          title="Tải về định dạng JSON"
          className={cn(buttonVariants({ variant: "outline", size: "xs" }))}
        >
          JSON
        </a>
        <a
          href={`/api/export/set/${set.id}?format=csv`}
          download
          title="Tải về định dạng CSV"
          className={cn(buttonVariants({ variant: "outline", size: "xs" }))}
        >
          CSV
        </a>
      </div>
    </div>
  )
}
