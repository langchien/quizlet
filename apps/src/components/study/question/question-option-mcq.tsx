"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { McqOptionInteractiveButton } from "./mcq-option-interactive-button"
import { McqOptionExamButton } from "./mcq-option-exam-button"

export type QuestionOptionMcqMode = "interactive" | "exam"

export interface QuestionOptionMcqProps {
  /** Chế độ hoạt động: "interactive" (phản hồi tức thì) hoặc "exam" (chọn bài thi) */
  mode?: QuestionOptionMcqMode
  /** Danh sách các lựa chọn đáp án */
  options?: string[]
  /** Cách đánh số thứ tự: numbers (1, 2, 3...) hoặc letters (A, B, C...) */
  numbering?: "numbers" | "letters"

  // Props chế độ Interactive (Học tập):
  /** Đáp án đúng cần so sánh */
  correctAnswer?: string
  /** Lựa chọn đã chọn hiện tại */
  selectedOption?: string | null
  /** Có hiển thị kết quả đúng/sai hay không */
  showFeedback?: boolean
  /** Callback trả về lựa chọn và trạng thái đúng/sai */
  onSelectInteractive?: (option: string, isCorrect: boolean) => void

  // Props chế độ Exam (Kiểm tra):
  /** Câu trả lời đã chọn của thí sinh */
  userAnswer?: string
  /** Callback khi thí sinh chọn đáp án */
  onSelectExam?: (option: string) => void

  // Props dùng chung:
  onSelect?: (option: string, isCorrect: boolean) => void
  disabled?: boolean
  className?: string
}

export function QuestionOptionMCQ({
  mode = "interactive",
  options,
  numbering,
  correctAnswer,
  selectedOption,
  showFeedback = false,
  onSelectInteractive,
  userAnswer,
  onSelectExam,
  onSelect,
  disabled = false,
  className,
}: QuestionOptionMcqProps) {
  if (!options || options.length === 0) return null

  // Mặc định numbering: interactive dùng numbers (1,2..), exam dùng letters (A,B..)
  const actualNumbering = numbering ?? (mode === "exam" ? "letters" : "numbers")

  const handleClick = (opt: string) => {
    const isCorrect = Boolean(correctAnswer && opt === correctAnswer)

    if (mode === "interactive") {
      if (onSelectInteractive) {
        onSelectInteractive(opt, isCorrect)
      } else if (onSelect) {
        onSelect(opt, isCorrect)
      }
    } else {
      if (onSelectExam) {
        onSelectExam(opt)
      } else if (onSelect) {
        onSelect(opt, isCorrect)
      }
    }
  }

  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      {options.map((opt, idx) => {
        const optionLabel =
          actualNumbering === "letters"
            ? String.fromCharCode(65 + idx)
            : String(idx + 1)

        if (mode === "interactive") {
          const isChosen = selectedOption === opt
          const isCorrectOpt = opt === correctAnswer

          return (
            <McqOptionInteractiveButton
              key={idx}
              opt={opt}
              label={optionLabel}
              isChosen={isChosen}
              isCorrectOpt={isCorrectOpt}
              showFeedback={showFeedback}
              disabled={disabled}
              onClick={() => handleClick(opt)}
            />
          )
        }

        // Mode Exam
        const effectiveSelected = userAnswer ?? selectedOption
        const isSelected = effectiveSelected === opt

        return (
          <McqOptionExamButton
            key={idx}
            opt={opt}
            label={optionLabel}
            isSelected={isSelected}
            disabled={disabled}
            onClick={() => handleClick(opt)}
          />
        )
      })}
    </div>
  )
}
