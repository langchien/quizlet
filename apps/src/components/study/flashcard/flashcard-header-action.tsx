"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FlashcardHeaderActionProps {
  icon: React.ReactNode
  title: string
  isActive?: boolean
  activeClassName?: string
  onClick: () => void
}

export function FlashcardHeaderAction({
  icon,
  title,
  isActive = false,
  activeClassName = "bg-primary/10 text-primary font-bold",
  onClick,
}: FlashcardHeaderActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg p-2 transition-colors",
        isActive
          ? activeClassName
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      title={title}
    >
      {icon}
    </button>
  )
}
