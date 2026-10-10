"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MistakeReviewMode } from "@/types/mistakes"

export interface MistakeReviewModeCardProps {
  mode: MistakeReviewMode
  title: string
  desc: string
  icon: LucideIcon
  color: string
  isSelected: boolean
  onSelect: (mode: MistakeReviewMode) => void
}

export function MistakeReviewModeCard({
  mode,
  title,
  desc,
  icon: Icon,
  color,
  isSelected,
  onSelect,
}: MistakeReviewModeCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      className={cn(
        "border-border flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all",
        isSelected
          ? "border-primary bg-primary/5 ring-primary/20 ring-2"
          : "hover:bg-muted/50"
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          color
        )}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <div className="text-foreground text-xs font-bold">{title}</div>
        <div className="text-muted-foreground text-[11px]">{desc}</div>
      </div>
    </button>
  )
}
