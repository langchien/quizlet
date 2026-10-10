"use client"

import * as React from "react"
import { Headphones } from "lucide-react"
import { StudySessionHeader } from "@/components/study/study-session-header"

interface ListenHeaderProps {
  setId: string
  currentIndex: number
  totalCards: number
}

export function ListenHeader({
  setId,
  currentIndex,
  totalCards,
}: ListenHeaderProps) {
  return (
    <StudySessionHeader
      setId={setId}
      current={currentIndex + 1}
      total={totalCards}
      progressColor="bg-cyan-500"
      modeBadge={{
        icon: <Headphones className="size-3.5" />,
        label: "Luyện nghe",
        className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold",
      }}
    />
  )
}
