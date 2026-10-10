"use client"

import * as React from "react"
import { Pencil } from "lucide-react"
import { StudySessionHeader } from "@/components/study/study-session-header"

interface WriteHeaderProps {
  setId: string
  currentIndex: number
  totalCards: number
}

export function WriteHeader({
  setId,
  currentIndex,
  totalCards,
}: WriteHeaderProps) {
  return (
    <StudySessionHeader
      setId={setId}
      current={currentIndex + 1}
      total={totalCards}
      progressColor="bg-amber-500"
      modeBadge={{
        icon: <Pencil className="size-3.5" />,
        label: "Luyện viết",
        className:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold",
      }}
    />
  )
}
