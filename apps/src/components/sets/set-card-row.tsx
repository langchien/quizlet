"use client"

import * as React from "react"
import { CardListItemRow } from "@/components/common"
import type { CardItem } from "@/types/set-detail"

interface SetCardRowProps {
  card: CardItem
  index: number
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onSpeak?: (text: string) => void
  onEdit: (card: CardItem) => void
  onDuplicate: (id: string) => void
  onDelete: (card: CardItem) => void
}

export const SetCardRow = React.memo(function SetCardRow({
  card,
  index,
  isSelected,
  onToggleSelect,
  onSpeak,
  onEdit,
  onDuplicate,
  onDelete,
}: SetCardRowProps) {
  return (
    <CardListItemRow<CardItem>
      card={card}
      index={index}
      isSelected={isSelected}
      onToggleSelect={onToggleSelect}
      onSpeak={onSpeak}
      onEdit={onEdit}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
    />
  )
})
