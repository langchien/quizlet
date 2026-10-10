"use client"

import * as React from "react"
import { Volume2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface LearnQuestionHeaderProps {
  typeLabel: string
  jlptLevel?: string | null
  onSpeak: () => void
}

export function LearnQuestionHeader({
  typeLabel,
  jlptLevel,
  onSpeak,
}: LearnQuestionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-[11px] font-bold">
          {typeLabel}
        </span>

        {jlptLevel && (
          <Badge variant="outline" className="text-[10px]">
            {jlptLevel}
          </Badge>
        )}
      </div>

      <button
        type="button"
        onClick={onSpeak}
        className="text-primary hover:bg-primary/10 rounded-full p-2 transition-colors"
        title="Phát âm tiếng Nhật"
      >
        <Volume2 className="size-4" />
      </button>
    </div>
  )
}
