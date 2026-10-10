"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface StudyHeaderExitProps {
  exitHref: string
  exitLabel?: string
  setName?: string
}

export function StudyHeaderExit({
  exitHref,
  exitLabel = "Thoát",
  setName,
}: StudyHeaderExitProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href={exitHref}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-semibold transition-colors"
      >
        <ChevronLeft className="size-4 shrink-0" />
        <span>{exitLabel}</span>
      </Link>
      {setName && (
        <Badge
          variant="outline"
          className="hidden max-w-[150px] truncate text-[10px] sm:inline-flex"
        >
          {setName}
        </Badge>
      )}
    </div>
  )
}
