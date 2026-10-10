"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"

export function CommandFooter() {
  return (
    <div className="border-border/60 bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-[11px]">
      <div className="flex items-center gap-1.5">
        <span>Dùng</span>
        <Kbd className="h-4 min-w-4 px-1 text-[10px]">↑</Kbd>
        <Kbd className="h-4 min-w-4 px-1 text-[10px]">↓</Kbd>
        <span>để chọn,</span>
        <Kbd className="h-4 min-w-4 px-1 text-[10px]">Enter</Kbd>
        <span>để mở</span>
      </div>
      <div className="flex items-center gap-1">
        <span>NihoMemo Search</span>
        <ArrowRight className="size-3" />
      </div>
    </div>
  )
}
