"use client"

import * as React from "react"
import { Spinner } from "@/components/ui/spinner"

export function CommandLoading() {
  return (
    <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-xs">
      <Spinner className="size-4" />
      <span>Đang tìm kiếm...</span>
    </div>
  )
}
