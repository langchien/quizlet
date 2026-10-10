"use client"

import * as React from "react"
import { TestRunnerHeader } from "./test-runner-header"
import { TestNavPalette } from "./test-nav-palette"
import { TestQuestionCard } from "./test-question-card"
import { ConfirmSubmitDialog, ExitConfirmDialog } from "./test-dialogs"
import type { TestQuestion } from "@/hooks/study/use-test-engine"

interface TestRunnerViewProps {
  questions: TestQuestion[]
  activeQuestionIndex: number
  setActiveQuestionIndex: React.Dispatch<React.SetStateAction<number>>
  answeredCount: number
  timeLeftSeconds: number | null
  isReverse: boolean
  confirmSubmitOpen: boolean
  setConfirmSubmitOpen: (open: boolean) => void
  exitConfirmOpen: boolean
  setExitConfirmOpen: (open: boolean) => void
  handleAnswerQuestion: (qIndex: number, ans: string) => void
  handleSubmitTest: () => void
  onExitTest: () => void
}

export function TestRunnerView({
  questions,
  activeQuestionIndex,
  setActiveQuestionIndex,
  answeredCount,
  timeLeftSeconds,
  isReverse,
  confirmSubmitOpen,
  setConfirmSubmitOpen,
  exitConfirmOpen,
  setExitConfirmOpen,
  handleAnswerQuestion,
  handleSubmitTest,
  onExitTest,
}: TestRunnerViewProps) {
  const currentQuestion = questions[activeQuestionIndex]
  const progressPct = Math.round((answeredCount / questions.length) * 100)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-20">
      <TestRunnerHeader
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        timeLeftSeconds={timeLeftSeconds}
        onRequestExit={() => setExitConfirmOpen(true)}
        onRequestSubmit={() => setConfirmSubmitOpen(true)}
      />

      {/* Question Navigation Grid */}
      <TestNavPalette
        questions={questions}
        activeQuestionIndex={activeQuestionIndex}
        onSelectQuestion={setActiveQuestionIndex}
        progressPct={progressPct}
      />

      {/* Main Current Question Card */}
      {currentQuestion && (
        <TestQuestionCard
          question={currentQuestion}
          activeQuestionIndex={activeQuestionIndex}
          totalQuestions={questions.length}
          isReverse={isReverse}
          onAnswerQuestion={handleAnswerQuestion}
          onPrevQuestion={() => setActiveQuestionIndex((prev) => prev - 1)}
          onNextQuestion={() => setActiveQuestionIndex((prev) => prev + 1)}
          onRequestSubmit={() => setConfirmSubmitOpen(true)}
        />
      )}

      {/* Dialogs */}
      <ConfirmSubmitDialog
        open={confirmSubmitOpen}
        onOpenChange={setConfirmSubmitOpen}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        onConfirm={handleSubmitTest}
      />

      <ExitConfirmDialog
        open={exitConfirmOpen}
        onOpenChange={setExitConfirmOpen}
        onExit={onExitTest}
      />
    </div>
  )
}
