"use client"

import * as React from "react"
import { Volume2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { LearnQuestionData } from "@/types/learn"

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
      {/* Question Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-[11px] font-bold">
            {questionTypeLabel}
          </span>

          {question.card.jlptLevel && (
            <Badge variant="outline" className="text-[10px]">
              {question.card.jlptLevel}
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

      {/* Prompt Presentation */}
      <div className="my-6 text-center">
        <div className="text-muted-foreground mb-1 text-xs font-medium">
          {promptGuidance}
        </div>
        <h2 className="font-japanese text-foreground text-3xl font-black tracking-tight sm:text-4xl">
          {question.prompt}
        </h2>
        {question.subPrompt && (
          <p className="font-japanese text-muted-foreground mt-2 text-base font-medium">
            {question.subPrompt}
          </p>
        )}
      </div>

      {/* Question Interactive Content (MCQ / TF / Written) */}
      {children}
    </div>
  )
}
