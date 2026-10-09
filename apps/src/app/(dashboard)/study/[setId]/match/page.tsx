"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMatchGame } from "@/hooks/study"
import {
  MatchHeader,
  MatchGrid,
  MatchResultCard,
} from "@/components/study/match"

export default function MatchStudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = (params.setId || params.id) as string

  const {
    allCards,
    setName,
    loading,
    tiles,
    selectedTileId,
    isCompleted,
    secondsFormatted,
    penaltyCount,
    matchedPairsCount,
    totalPairs,
    personalBestSecs,
    isNewRecord,
    startNewGame,
    handleTileClick,
  } = useMatchGame({ setId })

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang khởi tạo trò chơi Ghép đôi (Match)...
        </p>
      </div>
    )
  }

  if (allCards.length < 2) {
    return (
      <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-8 text-center shadow-md">
        <Sparkles className="text-muted-foreground mx-auto mb-3 size-12" />
        <h3 className="text-foreground text-lg font-bold">
          Chưa đủ thẻ để chơi
        </h3>
        <p className="text-muted-foreground mt-1 mb-6 text-xs">
          Trò chơi Ghép đôi yêu cầu bộ thẻ phải có ít nhất 2 thẻ từ vựng.
        </p>
        <Button onClick={() => router.push(`/sets/${setId}`)}>
          Quay về bộ thẻ
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-20">
      {/* Top Controls Header */}
      <MatchHeader
        setId={setId}
        setName={setName}
        secondsFormatted={secondsFormatted}
        totalPairs={totalPairs}
        matchedPairsCount={matchedPairsCount}
        onRestart={() => startNewGame(allCards)}
      />

      {/* MATCH GRID CONTAINER OR VICTORY RESULT */}
      {!isCompleted ? (
        <MatchGrid
          tiles={tiles}
          selectedTileId={selectedTileId}
          onTileClick={handleTileClick}
        />
      ) : (
        <MatchResultCard
          setId={setId}
          secondsFormatted={secondsFormatted}
          totalPairs={totalPairs}
          penaltyCount={penaltyCount}
          personalBestSecs={personalBestSecs}
          isNewRecord={isNewRecord}
          onRestart={() => startNewGame(allCards)}
        />
      )}
    </div>
  )
}
