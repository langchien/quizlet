"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface StudyHeaderModeBadgeProps {
  icon?: React.ReactNode
  label: string
  className?: string
}

export function StudyHeaderModeBadge({
  icon,
  label,
  className,
}: StudyHeaderModeBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
        className || "bg-primary/10 text-primary"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </div>
  )
}
