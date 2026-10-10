"use client"

import * as React from "react"
import { BookOpen } from "lucide-react"
import { STUDY_MODES } from "@/types"

export function LandingStudyModes() {
  return (
    <div className="mt-10 w-full max-w-3xl">
      <div className="text-muted-foreground mb-4 text-center text-xs font-medium tracking-wider uppercase">
        6 Chế độ học tập cốt lõi
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STUDY_MODES.map((mode) => (
          <div
            key={mode}
            className="border-border/50 bg-card/60 hover:border-primary/40 hover:bg-card flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-colors"
          >
            <BookOpen className="text-primary/70 mb-1.5 size-4" />
            <span className="text-foreground text-xs font-medium">{mode}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
