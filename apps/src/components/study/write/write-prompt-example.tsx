"use client"

import * as React from "react"

export interface WritePromptExampleProps {
  example?: string | null
  exampleTranslation?: string | null
}

export function WritePromptExample({
  example,
  exampleTranslation,
}: WritePromptExampleProps) {
  if (!example) return null

  return (
    <div className="bg-muted/40 mx-auto mt-4 max-w-lg rounded-2xl p-3 text-left">
      <div className="font-japanese text-foreground text-xs font-medium">
        {example}
      </div>
      {exampleTranslation && (
        <div className="text-muted-foreground mt-0.5 text-[11px]">
          {exampleTranslation}
        </div>
      )}
    </div>
  )
}
