"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CreateCardModal } from "@/components/modals/create-card-modal"
import { CreateSetModal } from "@/components/modals/create-set-modal"
import { useSetCardOperations } from "@/hooks/sets"
import {
  SetDetailHeader,
  SetStudyModesBar,
  SetCardsToolbar,
  SetCardsTable,
  SetBulkTagDialog,
  SetDeleteDialogs,
} from "@/components/sets"
import type { CardItem, SetDetailData, TagItem } from "@/types/set-detail"

export type { CardItem, SetDetailData }

interface SetDetailClientProps {
  initialSet: SetDetailData
  availableTags: TagItem[]
}

export function SetDetailClient({
  initialSet,
  availableTags,
}: SetDetailClientProps) {
  const router = useRouter()
  const setId = initialSet.id

  const ops = useSetCardOperations({ cards: initialSet.cards })

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header và Tổng quan tiến độ */}
      <SetDetailHeader
        set={initialSet}
        onEditSet={ops.openEditSetModal}
        onAddCard={ops.openAddCardModal}
      />

      {/* 6 Chế độ học tập */}
      <SetStudyModesBar setId={setId} />

      {/* Quản lý danh sách thẻ */}
      <div className="flex flex-col gap-4">
        <SetCardsToolbar
          totalCards={initialSet.cards.length}
          selectedCount={ops.selectedCardIds.size}
          searchQuery={ops.searchCard}
          onSearchChange={ops.setSearchCard}
          onBulkTag={ops.openBulkTagDialog}
          onBulkDelete={ops.openBulkDeleteDialog}
        />

        <SetCardsTable
          cards={ops.filteredCards}
          allCardsCount={initialSet.cards.length}
          selectedCardIds={ops.selectedCardIds}
          onToggleSelectAll={ops.toggleSelectAll}
          onToggleSelectCard={ops.toggleSelectCard}
          onSpeak={ops.speakJapanese}
          onEditCard={ops.openEditCardModal}
          onDuplicateCard={ops.handleDuplicateCard}
          onDeleteCard={ops.openDeleteCardDialog}
        />
      </div>

      {/* Modals & Dialogs */}
      <CreateCardModal
        open={ops.cardModalOpen}
        onOpenChange={ops.setCardModalOpen}
        studySetId={setId}
        editCard={ops.editingCard}
        onSuccess={() => router.refresh()}
      />

      <CreateSetModal
        open={ops.editSetModalOpen}
        onOpenChange={ops.setEditSetModalOpen}
        editSet={initialSet}
        onSuccess={() => router.refresh()}
      />

      <SetBulkTagDialog
        open={ops.bulkTagModalOpen}
        onOpenChange={ops.setBulkTagModalOpen}
        selectedCount={ops.selectedCardIds.size}
        availableTags={availableTags}
        selectedTagId={ops.selectedTagIdForBulk}
        onSelectTag={ops.setSelectedTagIdForBulk}
        onSubmit={ops.handleBulkTag}
        isPending={ops.isPending}
      />

      <SetDeleteDialogs
        cardToDelete={ops.cardToDelete}
        onCloseDeleteCard={ops.closeDeleteCardDialog}
        onConfirmDeleteCard={ops.confirmDeleteCard}
        bulkDeleteOpen={ops.bulkDeleteOpen}
        selectedCount={ops.selectedCardIds.size}
        onCloseBulkDelete={ops.closeBulkDeleteDialog}
        onConfirmBulkDelete={ops.confirmBulkDelete}
      />
    </div>
  )
}
