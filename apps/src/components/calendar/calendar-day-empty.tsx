"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"

export function CalendarDayEmpty() {
  return (
    <div className="border-border/60 bg-muted/10 rounded-2xl border border-dashed py-10 text-center">
      <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-500 opacity-60" />
      <p className="text-muted-foreground text-xs font-medium">
        Không có thẻ nào cần ôn tập vào ngày này.
      </p>
      <p className="text-muted-foreground mt-0.5 text-[11px]">
        Hệ thống sẽ nhắc nhở khi đến chu kỳ lặp lại tiếp theo!
      </p>
    </div>
  )
}
