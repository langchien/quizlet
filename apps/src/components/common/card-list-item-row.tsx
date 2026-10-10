"use client"

import * as React from "react"
import { Edit2, Copy, Trash2, CheckSquare, Square } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TableRow, TableCell } from "@/components/ui/table"
import { AudioPronounceButton } from "@/components/common/audio-pronounce-button"
import { cn } from "@/lib/utils"

export interface CardListItemData {
  id: string
  term: string
  reading?: string | null
  definition: string
  example?: string | null
  exampleTranslation?: string | null
  jlptLevel?: string | null
  wordType?: string | null
  tags?: Array<{ id: string; name: string; color: string }>
  srsData?: {
    status?: string | null
    correctCount?: number
    incorrectCount?: number
  } | null
  studySet?: {
    id: string
    name: string
  } | null
}

export interface CardListItemRowProps<
  T extends CardListItemData = CardListItemData,
> {
  /** Thông tin thẻ học hiển thị */
  card: T
  /** Chỉ số thứ tự của thẻ (0-indexed) */
  index?: number
  /** Thẻ có đang được chọn hay không */
  isSelected?: boolean
  /** Callback khi bấm checkbox chọn thẻ */
  onToggleSelect?: (id: string) => void
  /** Callback phát âm âm thanh tiếng Nhật */
  onSpeak?: (text: string) => void
  /** Callback khi bấm sửa thẻ */
  onEdit?: (card: T) => void
  /** Callback khi bấm nhân bản thẻ */
  onDuplicate?: (id: string) => void
  /** Callback khi bấm xóa thẻ */
  onDelete?: (card: T) => void
  /** Có hiển thị checkbox không (mặc định: true nếu có onToggleSelect) */
  showCheckbox?: boolean
  /** Có hiển thị cột số thứ tự không (mặc định: true nếu có index) */
  showNumber?: boolean
  /** Có hiển thị cột ví dụ không (mặc định: true) */
  showExample?: boolean
  /** Có hiển thị cột thẻ nhãn Tags không (mặc định: true) */
  showTags?: boolean
  /** Có hiển thị cột trạng thái SRS không (mặc định: true) */
  showSrsStatus?: boolean
  /** Slot tùy biến cho cột thao tác bên phải */
  actionsSlot?: React.ReactNode
  /** Class tùy biến cho TableRow */
  className?: string
}

function CardListItemRowInner<T extends CardListItemData = CardListItemData>({
  card,
  index,
  isSelected = false,
  onToggleSelect,
  onSpeak,
  onEdit,
  onDuplicate,
  onDelete,
  showCheckbox = true,
  showNumber = true,
  showExample = true,
  showTags = true,
  showSrsStatus = true,
  actionsSlot,
  className,
}: CardListItemRowProps<T>) {
  const srsStatus = card.srsData?.status || "New"
  const hasCheckbox = showCheckbox && !!onToggleSelect
  const hasNumber = showNumber && typeof index === "number"

  return (
    <TableRow
      className={cn(
        "hover:bg-muted/40 transition-colors",
        isSelected && "bg-primary/5",
        className
      )}
    >
      {/* Cột 1: Checkbox chọn hàng loạt */}
      {hasCheckbox && (
        <TableCell className="w-10 text-center">
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
      )}

      {/* Cột 2: Số thứ tự */}
      {hasNumber && (
        <TableCell className="text-muted-foreground w-12 text-center font-mono text-xs">
          {index + 1}
        </TableCell>
      )}

      {/* Cột 3: Từ vựng Kanji, Furigana & Loa phát âm */}
      <TableCell>
        <div className="flex items-start gap-2">
          <AudioPronounceButton
            text={card.term}
            reading={card.reading ?? undefined}
            size="xs"
            className="mt-0.5"
            onClick={onSpeak ? () => onSpeak(card.term) : undefined}
          />
          <div className="flex flex-col gap-0.5">
            <div className="text-foreground font-japanese flex items-center gap-1.5 text-sm font-bold">
              <span>{card.term}</span>
              {card.jlptLevel && (
                <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[9px] font-bold">
                  {card.jlptLevel}
                </span>
              )}
            </div>
            {card.reading && (
              <div className="text-muted-foreground font-japanese text-xs">
                {card.reading}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Cột 4: Nghĩa tiếng Việt & Từ loại */}
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

      {/* Cột 5: Câu ví dụ & Bản dịch */}
      {showExample && (
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
      )}

      {/* Cột 6: Danh sách nhãn Tags */}
      {showTags && (
        <TableCell className="hidden lg:table-cell">
          <div className="flex max-w-xs flex-wrap gap-1">
            {card.tags && card.tags.length > 0 ? (
              card.tags.map((tag) => (
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
              ))
            ) : (
              <span className="text-muted-foreground text-xs">--</span>
            )}
          </div>
        </TableCell>
      )}

      {/* Cột 7: Trạng thái SRS */}
      {showSrsStatus && (
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
      )}

      {/* Cột 8: Thao tác & Hành động */}
      <TableCell className="text-right">
        {actionsSlot ? (
          actionsSlot
        ) : (
          <div className="flex items-center justify-end gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(card)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                title="Chỉnh sửa thẻ"
              >
                <Edit2 className="size-3.5" />
              </button>
            )}
            {onDuplicate && (
              <button
                type="button"
                onClick={() => onDuplicate(card.id)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                title="Nhân bản thẻ"
              >
                <Copy className="size-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(card)}
                className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5 transition-colors"
                title="Xoá thẻ"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}

export const CardListItemRow = React.memo(
  CardListItemRowInner
) as typeof CardListItemRowInner
