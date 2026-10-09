"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StudySummary } from "@/components/study/study-summary"
import { useWriteSession } from "@/hooks/study"
import {
  WriteHeader,
  WritePromptCard,
  WriteHintBox,
  WriteInputForm,
  WriteFeedbackView,
} from "@/components/study/write"

export default function WriteStudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = (params.setId || params.id) as string

  const {
    cards,
    setName,
    loading,
    currentIndex,
    currentCard,
    userTyped,
    setUserTyped,
    failedAttempts,
    status,
    correctCards,
    incorrectCards,
    isCompleted,
    totalDuration,
    inputRef,
    speak,
    initSession,
    handleCheckAnswer,
    handleOverrideCorrect,
    handleNextCard,
  } = useWriteSession({ setId })

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang khởi tạo chế độ Viết (Write)...
        </p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-8 text-center shadow-md">
        <Pencil className="text-muted-foreground mx-auto mb-3 size-12" />
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
          mode="Write"
          totalCards={cards.length}
          correctCards={correctCards.length}
          incorrectCards={incorrectCards.length}
          durationSeconds={totalDuration}
          onRestart={initSession}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
      {/* Top Header Controls & Progress */}
      <WriteHeader
        setId={setId}
        currentIndex={currentIndex}
        totalCards={cards.length}
      />

      {/* Main Write Card Container */}
      <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8">
        {currentCard && (
          <>
            {/* Prompt Section */}
            <WritePromptCard currentCard={currentCard} onSpeak={speak} />

            {/* Hint Box */}
            <WriteHintBox
              failedAttempts={failedAttempts}
              status={status}
              currentCard={currentCard}
            />

            {/* Input Form */}
            <WriteInputForm
              inputRef={inputRef}
              userTyped={userTyped}
              onUserTypedChange={setUserTyped}
              status={status}
              onCheckAnswer={handleCheckAnswer}
              onNextCard={handleNextCard}
            />

            {/* Feedback / Revealed Answer Box */}
            <WriteFeedbackView
              status={status}
              currentCard={currentCard}
              onOverrideCorrect={handleOverrideCorrect}
              onNextCard={handleNextCard}
            />
          </>
        )}
      </div>
    </div>
  )
}
