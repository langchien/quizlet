"use client"

import * as React from "react"

export interface LearnQuestionPromptProps {
  guidance: string
  prompt: string
  subPrompt?: string | null
}

export function LearnQuestionPrompt({
  guidance,
  prompt,
  subPrompt,
}: LearnQuestionPromptProps) {
  return (
    <div className="my-6 text-center">
      <div className="text-muted-foreground mb-1 text-xs font-medium">
        {guidance}
      </div>
      <h2 className="font-japanese text-foreground text-3xl font-black tracking-tight sm:text-4xl">
        {prompt}
      </h2>
      {subPrompt && (
        <p className="font-japanese text-muted-foreground mt-2 text-base font-medium">
          {subPrompt}
        </p>
      )}
    </div>
  )
}
