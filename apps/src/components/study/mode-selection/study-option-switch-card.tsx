"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export interface StudyOptionSwitchCardProps {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function StudyOptionSwitchCard({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: StudyOptionSwitchCardProps) {
  return (
    <div className="border-border/60 bg-background/50 flex items-center justify-between rounded-2xl border p-3.5">
      <div className="flex flex-col gap-0.5">
        <Label
          htmlFor={id}
          className="text-foreground cursor-pointer text-xs font-bold"
        >
          {label}
        </Label>
        <p className="text-muted-foreground text-[10px]">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
