"use client"

import * as React from "react"

export interface TfPromptBoxProps {
  displayedAnswer?: string
  promptTitle?: string
}

export function TfPromptBox({
  displayedAnswer,
  promptTitle = "Có phải mang ý nghĩa là:",
}: TfPromptBoxProps) {
  if (!displayedAnswer) return null

  return (
    <div className="border-border/60 bg-muted/30 rounded-2xl border p-4 text-center">
      <span className="text-muted-foreground text-xs">{promptTitle}</span>
      <div className="text-foreground mt-1 text-xl font-bold">
        {displayedAnswer}
      </div>
    </div>
  )
}
