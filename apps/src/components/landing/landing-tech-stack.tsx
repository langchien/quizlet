"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const TECH_STACK_ITEMS = [
  "Next.js 16 (App Router)",
  "React 19",
  "TypeScript Strict",
  "Tailwind CSS v4",
  "Shadcn UI",
  "Prisma ORM 7",
  "PostgreSQL Docker",
  "JWT & HttpOnly Cookies",
  "Zustand State",
  "TanStack Query v5",
  "Zod Validation",
] as const

interface TechStackBadgeProps {
  name: string
}

/**
 * Sub-component nhãn hiển thị từng công nghệ trong stack
 */
export function TechStackBadge({ name }: TechStackBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="border-border/60 bg-muted/30 text-muted-foreground h-auto gap-1.5 rounded-full px-3 py-1 text-xs font-normal"
    >
      <CheckCircle2 className="size-3 text-emerald-500" />
      <span>{name}</span>
    </Badge>
  )
}

export function LandingTechStack() {
  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {TECH_STACK_ITEMS.map((tech) => (
        <TechStackBadge key={tech} name={tech} />
      ))}
    </div>
  )
}
