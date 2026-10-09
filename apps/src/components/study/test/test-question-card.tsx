"use client"

import * as React from "react"
import { Volume2, ChevronLeft, ArrowRight, CheckSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTTS } from "@/hooks/useTTS"
import { TestMcqOptions } from "./test-mcq-options"
import { TestTfOptions } from "./test-tf-options"
import { TestWrittenInput } from "./test-written-input"
import type { TestQuestion } from "@/hooks/study/use-test-engine"

interface TestQuestionCardProps {
  question: TestQuestion
  activeQuestionIndex: number
  totalQuestions: number
  isReverse: boolean
  onAnswerQuestion: (qIndex: number, ans: string) => void
  onPrevQuestion: () => void
  onNextQuestion: () => void
  onRequestSubmit: () => void
}

export function TestQuestionCard({
  question,
  activeQuestionIndex,
  totalQuestions,
  isReverse,
  onAnswerQuestion,
  onPrevQuestion,
  onNextQuestion,
  onRequestSubmit,
}: TestQuestionCardProps) {
  const { speak } = useTTS()
  const q = question

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8">
      {/* Question Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
            Câu {activeQuestionIndex + 1} / {totalQuestions}
          </span>

          <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[11px] font-medium">
            {q.kind === "multiple-choice"
              ? "Trắc nghiệm"
              : q.kind === "true-false"
                ? "Đúng hay Sai"
                : "Tự luận viết tiếng Nhật"}
          </span>

          {q.card.jlptLevel && (
            <Badge variant="outline" className="text-[10px]">
              {q.card.jlptLevel}
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={() => speak(q.card.term)}
          className="text-primary hover:bg-primary/10 rounded-full p-2 transition-colors"
          title="Phát âm tiếng Nhật"
        >
          <Volume2 className="size-4" />
        </button>
      </div>

      {/* Prompt Area */}
      <div className="my-6 text-center">
        <div className="text-muted-foreground mb-1 text-xs font-medium">
          {q.kind === "written"
            ? "Nghĩa tiếng Việt (Gõ từ tiếng Nhật tương ứng):"
            : isReverse
              ? "Nghĩa tiếng Việt:"
              : "Thuật ngữ tiếng Nhật:"}
        </div>
        <h2 className="font-japanese text-foreground text-3xl font-black tracking-tight sm:text-4xl">
          {q.prompt}
        </h2>
        {q.subPrompt && (
          <p className="font-japanese text-muted-foreground mt-2 text-base font-medium">
            {q.subPrompt}
          </p>
        )}
      </div>

      {/* Question Options / Inputs based on kind */}
      {q.kind === "multiple-choice" && (
        <TestMcqOptions
          options={q.options}
          userAnswer={q.userAnswer}
          onSelectOption={(opt) => onAnswerQuestion(activeQuestionIndex, opt)}
        />
      )}

      {q.kind === "true-false" && (
        <TestTfOptions
          displayedAnswer={q.tfPair?.displayedAnswer}
          userAnswer={q.userAnswer}
          onSelectAnswer={(ans) => onAnswerQuestion(activeQuestionIndex, ans)}
        />
      )}

      {q.kind === "written" && (
        <TestWrittenInput
          userAnswer={q.userAnswer}
          onAnswer={(val) => onAnswerQuestion(activeQuestionIndex, val)}
        />
      )}

      {/* Bottom Question Controls */}
      <div className="border-border/60 mt-8 flex items-center justify-between border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={activeQuestionIndex === 0}
          onClick={onPrevQuestion}
          className="gap-1 rounded-xl"
        >
          <ChevronLeft className="size-4" />
          <span>Câu trước</span>
        </Button>

        <span className="text-muted-foreground text-xs font-medium">
          Câu {activeQuestionIndex + 1} trên {totalQuestions}
        </span>

        {activeQuestionIndex + 1 < totalQuestions ? (
          <Button
            size="sm"
            onClick={onNextQuestion}
            className="gap-1 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
          >
            <span>Câu tiếp theo</span>
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onRequestSubmit}
            className="gap-1 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
          >
            <span>Nộp bài</span>
            <CheckSquare className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
