"use client"

import * as React from "react"
import { ChevronLeft, ListChecks, Clock, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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

  // Định dạng thời gian (phút:giây)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-20">
      {/* Top Header Bar */}
      <div className="border-border bg-card/80 sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExitConfirmOpen(true)}
            className="text-muted-foreground hover:text-foreground h-8 gap-1 px-2 text-xs"
          >
            <ChevronLeft className="size-4" />
            <span>Thoát</span>
          </Button>

          <div className="border-border/60 hidden h-4 w-px border-r sm:block" />

          {/* Answered Counter */}
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold">
            <ListChecks className="text-primary size-4" />
            <span>
              Đã làm:{" "}
              <b className="text-foreground">
                {answeredCount}/{questions.length}
              </b>
            </span>
          </div>
        </div>

        {/* Timer */}
        {timeLeftSeconds !== null && (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold",
              timeLeftSeconds < 60
                ? "animate-pulse bg-rose-500/20 text-rose-600 dark:text-rose-400"
                : "bg-muted text-foreground"
            )}
          >
            <Clock className="size-3.5" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>
        )}

        {/* Submit Action Button */}
        <Button
          size="sm"
          onClick={() => setConfirmSubmitOpen(true)}
          className="h-8 gap-1.5 rounded-xl bg-purple-600 px-4 font-bold text-white shadow-xs hover:bg-purple-700"
        >
          <span>Nộp bài</span>
          <CheckSquare className="size-3.5" />
        </Button>
      </div>

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
