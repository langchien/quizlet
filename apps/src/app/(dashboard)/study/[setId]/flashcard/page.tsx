"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StudySummary } from "@/components/study/study-summary"
import { ShortcutsCheatsheetModal } from "@/components/modals/shortcuts-cheatsheet-modal"
import { useFlashcardSession } from "@/hooks/study"
import {
  FlashcardHeader,
  FlashcardViewer,
  FlashcardActionBar,
} from "@/components/study/flashcard"

export default function FlashcardStudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = (params.setId || params.id) as string

  const {
    cards,
    setName,
    loading,
    currentIndex,
    currentCard,
    isFlipped,
    isReverse,
    setIsReverse,
    isShuffle,
    setIsShuffle,
    isAutoPlay,
    setIsAutoPlay,
    isFullscreen,
    toggleFullscreen,
    cheatsheetOpen,
    setCheatsheetOpen,
    correctCards,
    incorrectCards,
    isCompleted,
    totalDuration,
    handleFlip,
    handleSpeak,
    handleAnswer,
    handlePrev,
    handleNext,
    handleRestart,
    handleReviewMistakes,
  } = useFlashcardSession({ setId })

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang khởi tạo Flashcard...
        </p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-8 text-center shadow-md">
        <Layers className="text-muted-foreground mx-auto mb-3 size-12" />
        <h3 className="text-foreground text-lg font-bold">
          Không có thẻ nào để học
        </h3>
        <p className="text-muted-foreground mt-1 mb-6 text-xs">
          Bộ thẻ này chưa có thẻ từ vựng nào. Hãy thêm thẻ trước khi bắt đầu.
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
          mode="Flashcard"
          totalCards={cards.length}
          correctCards={correctCards.length}
          incorrectCards={incorrectCards.length}
          durationSeconds={totalDuration}
          onRestart={handleRestart}
          onReviewMistakes={handleReviewMistakes}
          hasMistakes={incorrectCards.length > 0}
        />
      </div>
    )
  }

  if (!currentCard) return null

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-12">
      {/* 1. Top Controls Bar */}
      <FlashcardHeader
        setId={setId}
        currentIndex={currentIndex}
        totalCards={cards.length}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        isReverse={isReverse}
        onToggleReverse={() => setIsReverse((prev) => !prev)}
        isAutoPlay={isAutoPlay}
        onToggleAutoPlay={() => setIsAutoPlay((prev) => !prev)}
        onOpenCheatsheet={() => setCheatsheetOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* 2. 3D Flashcard Viewer */}
      <FlashcardViewer
        card={currentCard}
        isFlipped={isFlipped}
        isReverse={isReverse}
        onFlip={handleFlip}
        onSpeak={handleSpeak}
      />

      {/* 3. Action Navigation & Rating Bar */}
      <FlashcardActionBar
        currentIndex={currentIndex}
        totalCards={cards.length}
        onPrev={handlePrev}
        onFlip={handleFlip}
        onNext={handleNext}
        onAnswer={handleAnswer}
      />

      {/* 4. Cheatsheet Modal */}
      <ShortcutsCheatsheetModal
        open={cheatsheetOpen}
        onOpenChange={setCheatsheetOpen}
      />
    </div>
  )
}
