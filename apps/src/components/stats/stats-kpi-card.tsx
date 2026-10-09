"use client"

import * as React from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StatsKpiCardProps {
  label: string
  value: React.ReactNode
  unit?: string
  growthPercent?: number
  growthDiff?: number
  previousSubtext?: string
  valueClassName?: string
}

export function StatsKpiCard({
  label,
  value,
  unit,
  growthPercent,
  growthDiff,
  previousSubtext,
  valueClassName = "text-foreground",
}: StatsKpiCardProps) {
  const hasGrowth = growthPercent !== undefined || growthDiff !== undefined
  const isPositive =
    growthPercent !== undefined ? growthPercent >= 0 : (growthDiff ?? 0) >= 0

  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-black ${valueClassName}`}>{value}</span>
        {unit && (
          <span className="text-muted-foreground text-xs font-medium">
            {unit}
          </span>
        )}
        {hasGrowth && (
          <Badge
            variant={isPositive ? "default" : "secondary"}
            className="gap-1 text-[10px] font-bold"
          >
            {isPositive ? (
              <ArrowUpRight className="size-3 text-emerald-400" />
            ) : (
              <ArrowDownRight className="size-3 text-rose-400" />
            )}
            {growthPercent !== undefined
              ? `${Math.abs(growthPercent)}%`
              : `${isPositive ? "+" : ""}${growthDiff}%`}
          </Badge>
        )}
      </div>
      {previousSubtext && (
        <span className="text-muted-foreground text-[11px]">
          {previousSubtext}
        </span>
      )}
    </div>
  )
}
