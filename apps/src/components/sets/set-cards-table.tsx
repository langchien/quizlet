"use client"

import * as React from "react"
import { CheckSquare, Square } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { SetCardRow } from "./set-card-row"
import type { CardItem } from "@/types/set-detail"

interface SetCardsTableProps {
  cards: CardItem[]
  allCardsCount: number
  selectedCardIds: Set<string>
  onToggleSelectAll: () => void
  onToggleSelectCard: (id: string) => void
  onSpeak: (text: string) => void
  onEditCard: (card: CardItem) => void
  onDuplicateCard: (id: string) => void
  onDeleteCard: (card: CardItem) => void
}

export function SetCardsTable({
  cards,
  allCardsCount,
  selectedCardIds,
  onToggleSelectAll,
  onToggleSelectCard,
  onSpeak,
  onEditCard,
  onDuplicateCard,
  onDeleteCard,
}: SetCardsTableProps) {
  const isAllSelected =
    allCardsCount > 0 && selectedCardIds.size === allCardsCount

  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-center">
              <button
                type="button"
                onClick={onToggleSelectAll}
                className="text-muted-foreground hover:text-foreground rounded p-1"
                title={isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              >
                {isAllSelected ? (
                  <CheckSquare className="text-primary size-4" />
                ) : (
                  <Square className="size-4" />
                )}
              </button>
            </TableHead>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Thuật ngữ & Cách đọc</TableHead>
            <TableHead>Định nghĩa tiếng Việt</TableHead>
            <TableHead className="hidden md:table-cell">Ví dụ</TableHead>
            <TableHead className="hidden lg:table-cell">Nhãn</TableHead>
            <TableHead className="w-28 text-center">SRS</TableHead>
            <TableHead className="w-24 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-muted-foreground h-32 text-center text-xs"
              >
                Chưa có thẻ nào trong bộ thẻ này hoặc không khớp với kết quả tìm
                kiếm.
              </TableCell>
            </TableRow>
          ) : (
            cards.map((card, idx) => (
              <SetCardRow
                key={card.id}
                card={card}
                index={idx}
                isSelected={selectedCardIds.has(card.id)}
                onToggleSelect={onToggleSelectCard}
                onSpeak={onSpeak}
                onEdit={onEditCard}
                onDuplicate={onDuplicateCard}
                onDelete={onDeleteCard}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
