"use client"

import * as React from "react"
import { cn } from "cn"

export interface DashboardKpiCardProps {
  title: string
  icon: React.ReactNode
  iconClassName?: string
  value: React.ReactNode
  subValue?: React.ReactNode
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function DashboardKpiCard({
  title,
  icon,
  iconClassName,
  value,
  subValue,
  action,
  children,
  className,
}: DashboardKpiCardProps) {
  return (
    <div
      className={cn(
        "border-border bg-card flex flex-col justify-between rounded-2xl border p-5 shadow-2xs",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium">
          {title}
        </span>
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-xl",
            iconClassName
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            {typeof value === "string" || typeof value === "number" ? (
              <span className="text-foreground text-2xl font-black">
                {value}
              </span>
            ) : (
              value
            )}
            {subValue && (
              <span className="text-muted-foreground text-xs font-medium">
                {subValue}
              </span>
            )}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  )
}
