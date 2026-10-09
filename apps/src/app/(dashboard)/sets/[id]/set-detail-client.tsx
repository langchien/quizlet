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

  const {
    searchCard,
    setSearchCard,
    filteredCards,
    selectedCardIds,
    toggleSelectAll,
    toggleSelectCard,
    cardModalOpen,
    setCardModalOpen,
    editingCard,
    setEditingCard,
    editSetModalOpen,
    setEditSetModalOpen,
    cardToDelete,
    setCardToDelete,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    bulkTagModalOpen,
    setBulkTagModalOpen,
    selectedTagIdForBulk,
    setSelectedTagIdForBulk,
    isPending,
    speakJapanese,
    confirmDeleteCard,
    handleDuplicateCard,
    confirmBulkDelete,
    handleBulkTag,
  } = useSetCardOperations({ cards: initialSet.cards })

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header và Tổng quan tiến độ */}
      <SetDetailHeader
        set={initialSet}
        onEditSet={() => setEditSetModalOpen(true)}
        onAddCard={() => {
          setEditingCard(null)
          setCardModalOpen(true)
        }}
      />

      {/* 6 Chế độ học tập */}
      <SetStudyModesBar setId={setId} />

      {/* Quản lý danh sách thẻ */}
      <div className="flex flex-col gap-4">
        <SetCardsToolbar
          totalCards={initialSet.cards.length}
          selectedCount={selectedCardIds.size}
          searchQuery={searchCard}
          onSearchChange={setSearchCard}
          onBulkTag={() => setBulkTagModalOpen(true)}
          onBulkDelete={() => setBulkDeleteOpen(true)}
        />

        <SetCardsTable
          cards={filteredCards}
          allCardsCount={initialSet.cards.length}
          selectedCardIds={selectedCardIds}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectCard={toggleSelectCard}
          onSpeak={speakJapanese}
          onEditCard={(card) => {
            setEditingCard(card)
            setCardModalOpen(true)
          }}
          onDuplicateCard={handleDuplicateCard}
          onDeleteCard={(card) => setCardToDelete(card)}
        />
      </div>

      {/* Modals & Dialogs */}
      <CreateCardModal
        open={cardModalOpen}
        onOpenChange={setCardModalOpen}
        studySetId={setId}
        editCard={editingCard}
        onSuccess={() => router.refresh()}
      />

      <CreateSetModal
        open={editSetModalOpen}
        onOpenChange={setEditSetModalOpen}
        editSet={initialSet}
        onSuccess={() => router.refresh()}
      />

      <SetBulkTagDialog
        open={bulkTagModalOpen}
        onOpenChange={setBulkTagModalOpen}
        selectedCount={selectedCardIds.size}
        availableTags={availableTags}
        selectedTagId={selectedTagIdForBulk}
        onSelectTag={setSelectedTagIdForBulk}
        onSubmit={handleBulkTag}
        isPending={isPending}
      />

      <SetDeleteDialogs
        cardToDelete={cardToDelete}
        onCloseDeleteCard={() => setCardToDelete(null)}
        onConfirmDeleteCard={confirmDeleteCard}
        bulkDeleteOpen={bulkDeleteOpen}
        selectedCount={selectedCardIds.size}
        onCloseBulkDelete={() => setBulkDeleteOpen(false)}
        onConfirmBulkDelete={confirmBulkDelete}
      />
    </div>
  )
}
