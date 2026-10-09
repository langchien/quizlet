"use client"

import * as React from "react"
import { Volume2, Edit2, Copy, Trash2, CheckSquare, Square } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TableRow, TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { CardItem } from "@/types/set-detail"

interface SetCardRowProps {
  card: CardItem
  index: number
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onSpeak: (text: string) => void
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
  const srsStatus = card.srsData?.status || "New"

  return (
    <TableRow className={cn(isSelected && "bg-primary/5")}>
      {/* Checkbox */}
      <TableCell className="text-center">
        <button
          type="button"
          onClick={() => onToggleSelect(card.id)}
          className="text-muted-foreground hover:text-foreground rounded p-1"
        >
          {isSelected ? (
            <CheckSquare className="text-primary size-4" />
          ) : (
            <Square className="size-4" />
          )}
        </button>
      </TableCell>

      {/* Number */}
      <TableCell className="text-muted-foreground text-center font-mono text-xs">
        {index + 1}
      </TableCell>

      {/* Term & Reading */}
      <TableCell>
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => onSpeak(card.term)}
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary mt-0.5 rounded-md p-1 transition-colors"
            title="Phát âm tiếng Nhật"
          >
            <Volume2 className="size-3.5" />
          </button>
          <div className="flex flex-col gap-0.5">
            <div className="text-foreground font-japanese flex items-center gap-1.5 text-sm font-bold">
              <span>{card.term}</span>
              {card.jlptLevel && (
                <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[9px] font-bold">
                  {card.jlptLevel}
                </span>
              )}
            </div>
            <div className="text-muted-foreground font-japanese text-xs">
              {card.reading}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Definition */}
      <TableCell>
        <div className="text-foreground text-xs font-medium">
          {card.definition}
        </div>
        {card.wordType && (
          <span className="text-muted-foreground text-[10px]">
            {card.wordType}
          </span>
        )}
      </TableCell>

      {/* Example */}
      <TableCell className="hidden md:table-cell">
        {card.example ? (
          <div className="flex max-w-xs flex-col gap-0.5">
            <div className="text-foreground/80 font-japanese truncate text-xs">
              {card.example}
            </div>
            {card.exampleTranslation && (
              <div className="text-muted-foreground truncate text-[11px]">
                {card.exampleTranslation}
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">--</span>
        )}
      </TableCell>

      {/* Tags */}
      <TableCell className="hidden lg:table-cell">
        <div className="flex max-w-xs flex-wrap gap-1">
          {card.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded border px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                borderColor: `${tag.color}40`,
                backgroundColor: `${tag.color}15`,
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </TableCell>

      {/* SRS Status */}
      <TableCell className="text-center">
        <Badge
          variant={
            srsStatus === "Mastered"
              ? "success"
              : srsStatus === "Learning"
                ? "warning"
                : "outline"
          }
          className="text-[10px]"
        >
          {srsStatus}
        </Badge>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(card)}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
            title="Chỉnh sửa thẻ"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(card.id)}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
            title="Nhân bản thẻ"
          >
            <Copy className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(card)}
            className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5 transition-colors"
            title="Xoá thẻ"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  )
})
