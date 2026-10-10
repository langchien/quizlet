"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
      {/* Khung hiển thị câu hỏi nhận định */}
      {displayedAnswer && (
        <div className="border-border/60 bg-muted/30 rounded-2xl border p-4 text-center">
          <span className="text-muted-foreground text-xs">{promptTitle}</span>
          <div className="text-foreground mt-1 text-xl font-bold">
            {displayedAnswer}
          </div>
        </div>
      )}

      {/* Grid 2 nút lựa chọn: Sai (X) & Đúng (V) */}
      <div className="grid grid-cols-2 gap-4">
        {mode === "interactive" ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={showFeedback || disabled}
              onClick={() => handleSelect("false")}
              className={cn(
                "h-14 gap-2 rounded-2xl border-rose-500/30 text-base font-bold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
                showFeedback &&
                  !isTrue &&
                  "border-emerald-500 bg-emerald-500/10 font-black text-emerald-600"
              )}
            >
              <X className="size-5" />
              <span>Sai ❌</span>
            </Button>

            <Button
              type="button"
              size="lg"
              disabled={showFeedback || disabled}
              onClick={() => handleSelect("true")}
              className={cn(
                "h-14 gap-2 rounded-2xl bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700",
                showFeedback && isTrue && "bg-emerald-600 font-black"
              )}
            >
              <Check className="size-5" />
              <span>Đúng ✅</span>
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={disabled}
              onClick={() => handleSelect("false")}
              className={cn(
                "h-14 rounded-2xl border-rose-500/30 text-base font-bold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
                userAnswer === "false" &&
                  "border-rose-600 bg-rose-500/20 font-black text-rose-700 ring-2 ring-rose-500"
              )}
            >
              <X className="size-5" />
              <span>Sai ❌</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={disabled}
              onClick={() => handleSelect("true")}
              className={cn(
                "h-14 rounded-2xl border-emerald-500/30 text-base font-bold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400",
                userAnswer === "true" &&
                  "border-emerald-600 bg-emerald-500/20 font-black text-emerald-700 ring-2 ring-emerald-500"
              )}
            >
              <Check className="size-5" />
              <span>Đúng ✅</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
