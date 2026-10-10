"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"

export interface StudyOptionSelectCardProps {
  label: string
  children: React.ReactNode
}

export function StudyOptionSelectCard({
  label,
  children,
}: StudyOptionSelectCardProps) {
  return (
    <div className="border-border/60 bg-background/50 flex flex-col gap-1.5 rounded-2xl border p-3.5">
      <Label className="text-foreground text-xs font-bold">{label}</Label>
      {children}
    </div>
  )
}
