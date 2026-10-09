"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StudySummary } from "@/components/study/study-summary"
import { useLearnSession } from "@/hooks/study"
import {
  LearnHeader,
  LearnQuestionCard,
  LearnMcqOptions,
  LearnTfOptions,
  LearnWrittenInput,
  LearnFeedbackView,
} from "@/components/study/learn"

export default function LearnStudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = (params.setId || params.id) as string

  const {
    allCards,
    setName,
    loading,
    currentQuestion,
    selectedOption,
    writtenAnswer,
    setWrittenAnswer,
    showFeedback,
    isCurrentCorrect,
    writtenFailedAttempts,
    correctCardIds,
    incorrectCardIds,
    isCompleted,
    totalDuration,
    isReverse,
    speak,
    initSession,
    handleSelectAnswer,
    handleCheckWritten,
    handleNextQuestion,
  } = useLearnSession({ setId })

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang khởi tạo chế độ học thích ứng (Learn)...
        </p>
      </div>
    )
  }

  if (allCards.length === 0) {
    return (
      <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-8 text-center shadow-md">
        <BrainCircuit className="text-muted-foreground mx-auto mb-3 size-12" />
        <h3 className="text-foreground text-lg font-bold">Chưa có thẻ nào</h3>
        <p className="text-muted-foreground mt-1 mb-6 text-xs">
          Bộ thẻ này trống. Hãy thêm thẻ trước khi học.
        </p>
        <Button onClick={() => router.push(`/sets/${setId}`)}>
          Quay về bộ thẻ
        </Button>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="py-8">
        <StudySummary
          setId={setId}
          setName={setName}
          mode="Learn"
          totalCards={allCards.length}
          correctCards={correctCardIds.size}
          incorrectCards={incorrectCardIds.size}
          durationSeconds={totalDuration}
          onRestart={initSession}
        />
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
      {/* 1. Header Điều hướng & Tiến độ */}
      <LearnHeader
        setId={setId}
        learnedCount={correctCardIds.size}
        totalCards={allCards.length}
      />

      {/* 2. Khung câu hỏi chính */}
      <LearnQuestionCard
        question={currentQuestion}
        isReverse={isReverse}
        onSpeak={() => speak(currentQuestion.card.term)}
      >
        {/* Dạng Trắc nghiệm */}
        {currentQuestion.type === "multiple-choice" && (
          <LearnMcqOptions
            options={currentQuestion.options}
            correctAnswer={currentQuestion.correctAnswer}
            selectedOption={selectedOption}
            showFeedback={showFeedback}
            onSelect={handleSelectAnswer}
          />
        )}

        {/* Dạng Đúng / Sai */}
        {currentQuestion.type === "true-false" && (
          <LearnTfOptions
            displayedAnswer={currentQuestion.tfPair?.displayedAnswer}
            isTrue={currentQuestion.tfPair?.isTrue}
            showFeedback={showFeedback}
            onSelect={(choice, isCorrect) =>
              handleSelectAnswer(choice, isCorrect)
            }
          />
        )}

        {/* Dạng Gõ từ tiếng Nhật */}
        {currentQuestion.type === "written" && (
          <LearnWrittenInput
            card={currentQuestion.card}
            correctAnswer={currentQuestion.correctAnswer}
            writtenAnswer={writtenAnswer}
            onWrittenAnswerChange={setWrittenAnswer}
            failedAttempts={writtenFailedAttempts}
            showFeedback={showFeedback}
            onSubmit={handleCheckWritten}
          />
        )}

        {/* Feedback Bar & Explanation */}
        {showFeedback && (
          <LearnFeedbackView
            isCorrect={isCurrentCorrect}
            correctAnswer={currentQuestion.correctAnswer}
            reading={currentQuestion.card.reading}
            example={currentQuestion.card.example}
            onNext={handleNextQuestion}
          />
        )}
      </LearnQuestionCard>
    </div>
  )
}
