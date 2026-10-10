"use client"

import * as React from "react"
import type { LearnQuestionData } from "@/types/learn"
import { LearnQuestionHeader } from "./learn-question-header"
import { LearnQuestionPrompt } from "./learn-question-prompt"

interface LearnQuestionCardProps {
  question: LearnQuestionData
  isReverse: boolean
  onSpeak: () => void
  children: React.ReactNode
}

export function LearnQuestionCard({
  question,
  isReverse,
  onSpeak,
  children,
}: LearnQuestionCardProps) {
  const questionTypeLabel =
    question.type === "multiple-choice"
      ? "Trắc nghiệm 4 lựa chọn"
      : question.type === "true-false"
        ? "Đúng hay Sai?"
        : "Gõ câu trả lời"

  const promptGuidance =
    question.type === "written"
      ? "Nghĩa tiếng Việt (Gõ từ tiếng Nhật tương ứng):"
      : isReverse
        ? "Nghĩa tiếng Việt:"
        : "Thuật ngữ tiếng Nhật:"

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8">
      <LearnQuestionHeader
        typeLabel={questionTypeLabel}
        jlptLevel={question.card.jlptLevel}
        onSpeak={onSpeak}
      />

      <LearnQuestionPrompt
        guidance={promptGuidance}
        prompt={question.prompt}
        subPrompt={question.subPrompt}
      />

      {/* Question Interactive Content (MCQ / TF / Written) */}
      {children}
    </div>
  )
}
