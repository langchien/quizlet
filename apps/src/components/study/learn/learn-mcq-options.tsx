"use client"

import * as React from "react"
import { QuestionOptionMCQ } from "@/components/study/question"

interface LearnMcqOptionsProps {
  options?: string[]
  correctAnswer: string
  selectedOption: string | null
  showFeedback: boolean
  onSelect: (option: string, isCorrect: boolean) => void
}

export function LearnMcqOptions({
  options,
  correctAnswer,
  selectedOption,
  showFeedback,
  onSelect,
}: LearnMcqOptionsProps) {
  return (
    <QuestionOptionMCQ
      mode="interactive"
      options={options}
      correctAnswer={correctAnswer}
      selectedOption={selectedOption}
      showFeedback={showFeedback}
      onSelectInteractive={onSelect}
    />
  )
}
