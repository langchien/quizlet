"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"

export function CommandFooter() {
  return (
    <div className="border-border/60 bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-[11px]">
      <span>
        Dùng <strong>↑</strong> <strong>↓</strong> để chọn,{" "}
        <strong>Enter</strong> để mở
      </span>
      <span className="flex items-center gap-1">
        <span>NihoMemo Search</span>
        <ArrowRight className="size-3" />
      </span>
    </div>
  )
}
