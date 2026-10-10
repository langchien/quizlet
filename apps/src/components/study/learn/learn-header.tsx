"use client"

import * as React from "react"
import { BrainCircuit } from "lucide-react"
import { StudySessionHeader } from "@/components/study/study-session-header"

interface LearnHeaderProps {
  setId: string
  learnedCount: number
  totalCards: number
}

export function LearnHeader({
  setId,
  learnedCount,
  totalCards,
}: LearnHeaderProps) {
  return (
    <StudySessionHeader
      setId={setId}
      current={learnedCount}
      total={totalCards}
      counterLabel="đã thuộc"
      progressColor="bg-emerald-500"
      modeBadge={{
        icon: <BrainCircuit className="size-3.5" />,
        label: "Học thích ứng",
        className:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold",
      }}
    />
  )
}
