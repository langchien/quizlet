"use client"

import * as React from "react"

export interface SettingsDataActionCardProps {
  title: string
  description: string
  action: React.ReactNode
}

export function SettingsDataActionCard({
  title,
  description,
  action,
}: SettingsDataActionCardProps) {
  return (
    <div className="border-border/70 bg-card hover:border-primary/50 flex flex-col items-start justify-between gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1">
        <h4 className="text-foreground text-sm font-semibold">{title}</h4>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {description}
        </p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}
