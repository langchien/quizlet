"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"

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
]

export function LandingTechStack() {
  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {TECH_STACK_ITEMS.map((tech) => (
        <span
          key={tech}
          className="border-border/60 bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
        >
          <CheckCircle2 className="size-3 text-emerald-500" />
          {tech}
        </span>
      ))}
    </div>
  )
}
