"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import type { ParsedJsonSet } from "@/hooks/import-export/use-json-import"

interface JsonSetsSummaryProps {
  sets: ParsedJsonSet[]
}

export function JsonSetsSummary({ sets }: JsonSetsSummaryProps) {
  if (sets.length === 0) return null

  return (
    <div className="border-border/60 bg-muted/30 flex flex-col gap-2 rounded-xl border p-4">
      <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
        <span>Đã nhận diện hợp lệ {sets.length} bộ thẻ:</span>
      </div>
      <ul className="text-muted-foreground flex list-inside list-disc flex-col gap-1 text-xs">
        {sets.map((s, idx) => (
          <li key={idx}>
            <span className="text-foreground font-semibold">
              {s.setName || s.name || `Bộ thẻ ${idx + 1}`}
            </span>{" "}
            — {s.cards?.length || 0} thẻ
          </li>
        ))}
      </ul>
    </div>
  )
}
