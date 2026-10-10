"use client"

import * as React from "react"
import { QuestionOptionTF } from "@/components/study/question"

interface LearnTfOptionsProps {
  displayedAnswer?: string
  isTrue?: boolean
  showFeedback: boolean
  onSelect: (choice: string, isCorrect: boolean) => void
}

export function LearnTfOptions({
  displayedAnswer,
  isTrue,
  showFeedback,
  onSelect,
}: LearnTfOptionsProps) {
  return (
    <QuestionOptionTF
      mode="interactive"
      displayedAnswer={displayedAnswer}
      promptTitle="Có phải có nghĩa là:"
      isTrue={isTrue}
      showFeedback={showFeedback}
      onSelectInteractive={onSelect}
    />
  )
}
