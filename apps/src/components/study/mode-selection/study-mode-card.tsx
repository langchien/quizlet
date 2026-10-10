"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface StudyModeItem {
  id: string
  title: string
  desc: string
  icon: React.ElementType
  href: string
  color: string
  badge: string
  accent: string
  bgHover: string
}

interface StudyModeCardProps {
  mode: StudyModeItem
}

export function StudyModeCard({ mode }: StudyModeCardProps) {
  const Icon = mode.icon

  return (
    <Link
      href={mode.href}
      className={cn(
        "group border-border bg-card relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        mode.bgHover
      )}
    >
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-105",
              mode.color
            )}
          >
            <Icon className="size-7" />
          </div>

          <Badge variant="secondary" className="text-[10px] font-semibold">
            {mode.badge}
          </Badge>
        </div>

        <h3 className="text-foreground group-hover:text-primary text-lg font-bold transition-colors">
          {mode.title}
        </h3>
        <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
          {mode.desc}
        </p>
      </div>

      <div className="border-border/60 mt-6 flex items-center justify-between border-t pt-4">
        <span className="text-muted-foreground group-hover:text-foreground text-xs font-semibold transition-colors">
          Bắt đầu học
        </span>
        <div className="bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground flex size-8 items-center justify-center rounded-xl transition-colors">
          <ArrowRight className="size-4" />
        </div>
      </div>
    </Link>
  )
}
