"use client"

import * as React from "react"
import { BookOpen } from "lucide-react"
import { STUDY_MODES, type StudyMode } from "@/types"

interface StudyModeCardProps {
  mode: StudyMode
}

/**
 * Sub-component hiển thị thẻ đại diện cho một chế độ học
 */
export function StudyModeCard({ mode }: StudyModeCardProps) {
  return (
    <div className="border-border/50 bg-card/60 hover:border-primary/40 hover:bg-card flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-colors">
      <BookOpen className="text-primary/70 mb-1.5 size-4" />
      <span className="text-foreground text-xs font-medium">{mode}</span>
    </div>
  )
}

export function LandingStudyModes() {
  return (
    <section className="mt-10 w-full max-w-3xl">
      <h2 className="text-muted-foreground mb-4 text-center text-xs font-medium tracking-wider uppercase">
        6 Chế độ học tập cốt lõi
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STUDY_MODES.map((mode) => (
          <StudyModeCard key={mode} mode={mode} />
        ))}
      </div>
    </section>
  )
}
