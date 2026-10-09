"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function Tooltip({
  content,
  children,
  className,
}: {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            "bg-foreground text-background animate-in fade-in-0 zoom-in-95 pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 overflow-hidden rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap shadow-md",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
