"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StudySummary } from "@/components/study/study-summary"
import { useListenSession } from "@/hooks/study"
import {
  ListenHeader,
  ListenAudioPlayer,
  ListenAnswerForm,
  ListenResultCard,
} from "@/components/study/listen"

export default function ListenStudyPage() {
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
    playbackRate,
    setPlaybackRate,
    correctCards,
    incorrectCards,
    isCompleted,
    totalDuration,
    inputRef,
    isPlaying,
    initSession,
    handlePlayAudio,
    handleCheckAnswer,
    handleGiveUp,
    handleNextCard,
  } = useListenSession({ setId })

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang khởi tạo chế độ Luyện nghe (Listen)...
        </p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-8 text-center shadow-md">
        <Headphones className="text-muted-foreground mx-auto mb-3 size-12" />
        <h3 className="text-foreground text-lg font-bold">Chưa có thẻ nào</h3>
        <p className="text-muted-foreground mt-1 mb-6 text-xs">
          Bộ thẻ này trống. Hãy thêm thẻ trước khi luyện nghe.
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
          mode="Listen"
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
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-20">
      {/* Top Header Controls & Progress */}
      <ListenHeader
        setId={setId}
        currentIndex={currentIndex}
        totalCards={cards.length}
      />

      {/* Main Listening Box */}
      <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8">
        {/* Speed & Audio Controls */}
        <ListenAudioPlayer
          playbackRate={playbackRate}
          onPlaybackRateChange={setPlaybackRate}
          onPlayAudio={handlePlayAudio}
          isPlaying={isPlaying}
          jlptLevel={currentCard?.jlptLevel}
        />

        {/* Input & Form Action */}
        {currentCard && (
          <ListenAnswerForm
            inputRef={inputRef}
            userTyped={userTyped}
            onUserTypedChange={setUserTyped}
            status={status}
            failedAttempts={failedAttempts}
            currentCard={currentCard}
            onCheckAnswer={handleCheckAnswer}
            onGiveUp={handleGiveUp}
            onNextCard={handleNextCard}
          />
        )}

        {/* Feedback & Revealed Answer */}
        {currentCard && (
          <ListenResultCard
            status={status}
            currentCard={currentCard}
            onNextCard={handleNextCard}
          />
        )}
      </div>
    </div>
  )
}
