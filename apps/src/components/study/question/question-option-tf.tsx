"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TfPromptBox } from "./tf-prompt-box"
import { TfOptionInteractiveButtons } from "./tf-option-interactive-buttons"
import { TfOptionExamButtons } from "./tf-option-exam-buttons"

export type QuestionOptionTfMode = "interactive" | "exam"

export interface QuestionOptionTfProps {
  /** Chế độ hoạt động: "interactive" (phản hồi tức thì) hoặc "exam" (chọn bài thi) */
  mode?: QuestionOptionTfMode
  /** Nội dung / ý nghĩa đang hiển thị để phán đoán Đúng/Sai */
  displayedAnswer?: string
  /** Câu dẫn hướng dẫn (mặc định: "Có phải mang ý nghĩa là:") */
  promptTitle?: string

  // Props chế độ Interactive (Học tập):
  /** Câu hỏi này về bản chất là đúng (true) hay sai (false) */
  isTrue?: boolean
  /** Có hiển thị kết quả đúng/sai hay không */
  showFeedback?: boolean
  /** Callback trả về lựa chọn và kết quả đúng/sai */
  onSelectInteractive?: (choice: string, isCorrect: boolean) => void

  // Props chế độ Exam (Kiểm tra):
  /** Lựa chọn hiện tại của thí sinh ("true" | "false") */
  userAnswer?: string
  /** Callback khi thí sinh chọn đáp án */
  onSelectExam?: (choice: string) => void

  // Props dùng chung:
  onSelect?: (choice: string, isCorrect: boolean) => void
  disabled?: boolean
  className?: string
}

export function QuestionOptionTF({
  mode = "interactive",
  displayedAnswer,
  promptTitle = "Có phải mang ý nghĩa là:",
  isTrue,
  showFeedback = false,
  onSelectInteractive,
  userAnswer,
  onSelectExam,
  onSelect,
  disabled = false,
  className,
}: QuestionOptionTfProps) {
  const handleSelect = (choice: "true" | "false") => {
    const isCorrect = choice === "true" ? isTrue === true : isTrue === false

    if (mode === "interactive") {
      if (onSelectInteractive) {
        onSelectInteractive(choice, isCorrect)
      } else if (onSelect) {
        onSelect(choice, isCorrect)
      }
    } else {
      if (onSelectExam) {
        onSelectExam(choice)
      } else if (onSelect) {
        onSelect(choice, isCorrect)
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <TfPromptBox
        displayedAnswer={displayedAnswer}
        promptTitle={promptTitle}
      />

      {mode === "interactive" ? (
        <TfOptionInteractiveButtons
          isTrue={isTrue}
          showFeedback={showFeedback}
          disabled={disabled}
          onSelect={handleSelect}
        />
      ) : (
        <TfOptionExamButtons
          userAnswer={userAnswer}
          disabled={disabled}
          onSelect={handleSelect}
        />
      )}
    </div>
  )
}
