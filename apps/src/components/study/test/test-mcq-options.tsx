"use client"

import * as React from "react"
import { QuestionOptionMCQ } from "@/components/study/question"

interface TestMcqOptionsProps {
  options?: string[]
  userAnswer?: string
  onSelectOption: (ans: string) => void
}

export function TestMcqOptions({
  options,
  userAnswer,
  onSelectOption,
}: TestMcqOptionsProps) {
  return (
    <QuestionOptionMCQ
      mode="exam"
      options={options}
      userAnswer={userAnswer}
      onSelectExam={onSelectOption}
    />
  )
}
