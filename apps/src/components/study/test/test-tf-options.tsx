"use client"

import * as React from "react"
import { QuestionOptionTF } from "@/components/study/question"

interface TestTfOptionsProps {
  displayedAnswer?: string
  userAnswer?: string
  onSelectAnswer: (ans: string) => void
}

export function TestTfOptions({
  displayedAnswer,
  userAnswer,
  onSelectAnswer,
}: TestTfOptionsProps) {
  return (
    <QuestionOptionTF
      mode="exam"
      displayedAnswer={displayedAnswer}
      promptTitle="Có phải mang ý nghĩa là:"
      userAnswer={userAnswer}
      onSelectExam={onSelectAnswer}
    />
  )
}
