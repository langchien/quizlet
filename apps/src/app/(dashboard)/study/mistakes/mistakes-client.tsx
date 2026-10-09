"use client"

import * as React from "react"
import { useMistakesNotebook } from "@/hooks/study"
import {
  MistakesHeader,
  MistakesToolbar,
  MistakesCardsTable,
  MistakesQuickStudyDialog,
} from "@/components/study/mistakes"
import type { MistakeCard } from "@/types/mistakes"

export type { MistakeCard }

interface MistakesClientProps {
  initialItems: MistakeCard[]
}

export function MistakesClient({ initialItems }: MistakesClientProps) {
  const {
    items,
    isFilterPending,
    selectedSetId,
    selectedJLPT,
    sortBy,
    uniqueSets,
    launchModalOpen,
    setLaunchModalOpen,
    chosenMode,
    setChosenMode,
    isStartingReview,
    handleFilterChange,
    handleStartReviewSession,
    speak,
  } = useMistakesNotebook({ initialItems })

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header Banner & Bộ lọc */}
      <div className="border-border from-card via-card relative overflow-hidden rounded-3xl border bg-gradient-to-br to-rose-500/5 p-6 shadow-xs sm:p-8">
        <MistakesHeader
          totalCount={items.length}
          isFilterPending={isFilterPending}
          onLaunchReview={() => setLaunchModalOpen(true)}
        />

        <MistakesToolbar
          selectedSetId={selectedSetId}
          selectedJLPT={selectedJLPT}
          sortBy={sortBy}
          uniqueSets={uniqueSets}
          isFilterPending={isFilterPending}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Bảng Danh sách lỗi sai */}
      <MistakesCardsTable
        items={items}
        isFilterPending={isFilterPending}
        onSpeak={speak}
      />

      {/* Modal Chọn Chế Độ Ôn Lại Lỗi Sai */}
      <MistakesQuickStudyDialog
        open={launchModalOpen}
        onOpenChange={setLaunchModalOpen}
        itemsCount={items.length}
        chosenMode={chosenMode}
        onChosenModeChange={setChosenMode}
        isStartingReview={isStartingReview}
        onStartReview={handleStartReviewSession}
      />
    </div>
  )
}
