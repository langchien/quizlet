"use client"

import * as React from "react"

export interface MistakesToolbarFilterItemProps {
  label: string
  children: React.ReactNode
}

export function MistakesToolbarFilterItem({
  label,
  children,
}: MistakesToolbarFilterItemProps) {
  return (
    <div>
      <label className="text-muted-foreground mb-1 block text-[11px] font-bold">
        {label}
      </label>
      {children}
    </div>
  )
}
