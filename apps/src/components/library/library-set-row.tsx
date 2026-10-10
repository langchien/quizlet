"use client"

import * as React from "react"
import Link from "next/link"
import { Play, Folder } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LibrarySetActionMenu } from "./library-set-action-menu"
import type { LibraryStudySetItem } from "@/types/library"

interface LibrarySetRowInfoProps {
  set: LibraryStudySetItem
}

/**
 * Sub-component hiển thị tiêu đề, thư mục và mô tả ngắn ở dạng hàng
 */
export function LibrarySetRowInfo({ set }: LibrarySetRowInfoProps) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/sets/${set.id}`}
          className="text-foreground group-hover:text-primary text-sm font-bold transition-colors"
        >
          {set.name}
        </Link>
        {set.folder && (
          <Badge
            variant="secondary"
            className="h-auto gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400"
          >
            <Folder className="size-3" />
            <span>{set.folder.name}</span>
          </Badge>
        )}
      </div>
      {set.description && (
        <p className="text-muted-foreground mt-0.5 max-w-xl truncate text-xs">
          {set.description}
        </p>
      )}
    </div>
  )
}

interface LibrarySetRowStatsProps {
  cardCount: number
  percentage: number
}

/**
 * Sub-component hiển thị số thẻ và tỷ lệ thuộc
 */
export function LibrarySetRowStats({
  cardCount,
  percentage,
}: LibrarySetRowStatsProps) {
  return (
    <div className="text-right">
      <div className="text-foreground text-xs font-semibold">
        {cardCount} thẻ
      </div>
      <div className="text-[10px] font-medium text-emerald-500">
        Đã thuộc: {percentage}%
      </div>
    </div>
  )
}

export interface LibrarySetRowProps {
  set: LibraryStudySetItem
  onEdit: (set: LibraryStudySetItem) => void
  onDuplicate: (id: string, name: string) => void
  onDelete: (set: LibraryStudySetItem) => void
}

export function LibrarySetRow({
  set,
  onEdit,
  onDuplicate,
  onDelete,
}: LibrarySetRowProps) {
  const percentage = set.progress?.percentage || 0

  return (
    <div className="hover:bg-muted/30 group flex flex-col justify-between gap-3 p-4 transition-colors sm:flex-row sm:items-center">
      <LibrarySetRowInfo set={set} />

      <div className="flex shrink-0 items-center gap-4">
        <LibrarySetRowStats cardCount={set.cardCount} percentage={percentage} />

        <Link
          href={`/sets/${set.id}`}
          className="bg-primary/10 hover:bg-primary/20 text-primary inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
        >
          <Play className="size-3 fill-current" />
          <span>Học</span>
        </Link>

        <LibrarySetActionMenu
          set={set}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}
