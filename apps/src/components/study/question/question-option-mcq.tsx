"use client"

import * as React from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

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

          let style =
            "border-border bg-background hover:border-primary/50 hover:bg-muted/50 text-foreground"
          if (showFeedback) {
            if (isCorrectOpt) {
              style =
                "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
            } else if (isChosen && !isCorrectOpt) {
              style =
                "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
            } else {
              style = "opacity-40 border-border bg-background"
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={showFeedback || disabled}
              onClick={() => handleClick(opt)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition-all duration-150",
                style
              )}
            >
              <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold">
                {optionLabel}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
              {showFeedback && isCorrectOpt && (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              )}
              {showFeedback && isChosen && !isCorrectOpt && (
                <XCircle className="size-4 shrink-0 text-rose-500" />
              )}
            </button>
          )
        }

        // Mode Exam
        const effectiveSelected = userAnswer ?? selectedOption
        const isSelected = effectiveSelected === opt

        return (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => handleClick(opt)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition-all duration-150",
              isSelected
                ? "border-purple-600 bg-purple-500/10 font-bold text-purple-700 shadow-xs ring-1 ring-purple-600 dark:text-purple-300"
                : "border-border bg-background hover:bg-muted/50 text-foreground hover:border-purple-400"
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold",
                isSelected
                  ? "bg-purple-600 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {optionLabel}
            </span>
            <span className="flex-1 leading-snug">{opt}</span>
          </button>
        )
      })}
    </div>
  )
}
