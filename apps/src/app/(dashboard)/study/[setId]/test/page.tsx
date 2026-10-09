"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTestEngine } from "@/hooks/study/use-test-engine"
import { TestConfigView } from "@/components/study/test/test-config-view"
import { TestRunnerView } from "@/components/study/test/test-runner-view"
import { TestResultView } from "@/components/study/test/test-result-view"

export default function TestStudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = (params.setId || params.id) as string

  const {
    loading,
    allCards,
    setName,
    testPhase,
    setTestPhase,
    questionCount,
    setQuestionCount,
    allowMultipleChoice,
    setAllowMultipleChoice,
    allowTrueFalse,
    setAllowTrueFalse,
    allowWritten,
    setAllowWritten,
    timeLimitMinutes,
    setTimeLimitMinutes,
    isReverse,
    setIsReverse,
    personalBestScore,
    questions,
    activeQuestionIndex,
    setActiveQuestionIndex,
    timeLeftSeconds,
    answeredCount,
    confirmSubmitOpen,
    setConfirmSubmitOpen,
    exitConfirmOpen,
    setExitConfirmOpen,
    handleAnswerQuestion,
    handleStartTest,
    handleSubmitTest,
    handleRestartTest,
    score,
    correctCount,
    incorrectCount,
    totalDuration,
  } = useTestEngine(setId)

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang khởi tạo bài kiểm tra...
        </p>
      </div>
    )
  }

  if (allCards.length === 0) {
    return (
      <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-8 text-center shadow-md">
        <CheckSquare className="text-muted-foreground mx-auto mb-3 size-12" />
        <h3 className="text-foreground text-lg font-bold">
          Chưa có thẻ nào trong bộ này
        </h3>
        <p className="text-muted-foreground mt-1 mb-6 text-xs">
          Hãy thêm thẻ từ vựng vào bộ thẻ trước khi tạo bài kiểm tra.
        </p>
        <Button onClick={() => router.push(`/sets/${setId}`)}>
          Quay về bộ thẻ
        </Button>
      </div>
    )
  }

  if (testPhase === "config") {
    return (
      <TestConfigView
        setId={setId}
        setName={setName}
        totalCards={allCards.length}
        questionCount={questionCount}
        setQuestionCount={setQuestionCount}
        allowMultipleChoice={allowMultipleChoice}
        setAllowMultipleChoice={setAllowMultipleChoice}
        allowTrueFalse={allowTrueFalse}
        setAllowTrueFalse={setAllowTrueFalse}
        allowWritten={allowWritten}
        setAllowWritten={setAllowWritten}
        timeLimitMinutes={timeLimitMinutes}
        setTimeLimitMinutes={setTimeLimitMinutes}
        isReverse={isReverse}
        setIsReverse={setIsReverse}
        personalBestScore={personalBestScore}
        onStartTest={handleStartTest}
      />
    )
  }

  if (testPhase === "testing") {
    return (
      <TestRunnerView
        questions={questions}
        activeQuestionIndex={activeQuestionIndex}
        setActiveQuestionIndex={setActiveQuestionIndex}
        answeredCount={answeredCount}
        timeLeftSeconds={timeLeftSeconds}
        isReverse={isReverse}
        confirmSubmitOpen={confirmSubmitOpen}
        setConfirmSubmitOpen={setConfirmSubmitOpen}
        exitConfirmOpen={exitConfirmOpen}
        setExitConfirmOpen={setExitConfirmOpen}
        handleAnswerQuestion={handleAnswerQuestion}
        handleSubmitTest={handleSubmitTest}
        onExitTest={() => setTestPhase("config")}
      />
    )
  }

  return (
    <TestResultView
      setId={setId}
      score={score}
      correctCount={correctCount}
      incorrectCount={incorrectCount}
      totalDuration={totalDuration}
      questions={questions}
      onRestartTest={handleRestartTest}
    />
  )
}
