"use client"

import * as React from "react"
import Link from "next/link"
import { Folder, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LibrarySetActionMenu } from "./library-set-action-menu"
import type { LibraryStudySetItem } from "@/types/library"

interface LibrarySetFolderBadgeProps {
  name: string
}

/**
 * Sub-component nhãn hiển thị thư mục của bộ thẻ
 */
export function LibrarySetFolderBadge({ name }: LibrarySetFolderBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="mb-2 h-auto gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400"
    >
      <Folder className="size-3" />
      <span>{name}</span>
    </Badge>
  )
}

interface LibrarySetProgressBarProps {
  percentage: number
}

/**
 * Sub-component thanh tiến độ học tập của bộ thẻ
 */
export function LibrarySetProgressBar({
  percentage,
}: LibrarySetProgressBarProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-muted-foreground flex justify-between text-[11px]">
        <span>Tiến độ ghi nhớ</span>
        <span className="text-foreground font-semibold">{percentage}%</span>
      </div>
      <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export interface LibrarySetCardProps {
  set: LibraryStudySetItem
  onEdit: (set: LibraryStudySetItem) => void
  onDuplicate: (id: string, name: string) => void
  onDelete: (set: LibraryStudySetItem) => void
}

export function LibrarySetCard({
  set,
  onEdit,
  onDuplicate,
  onDelete,
}: LibrarySetCardProps) {
  const percentage = set.progress?.percentage || 0

  return (
    <div className="group border-border bg-card hover:border-primary/40 relative flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-md">
      <div>
        {/* Top header row: Folder & Title + Action Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {set.folder && <LibrarySetFolderBadge name={set.folder.name} />}
            <Link
              href={`/sets/${set.id}`}
              className="text-foreground group-hover:text-primary line-clamp-1 block text-base font-bold transition-colors"
            >
              {set.name}
            </Link>
          </div>

          <LibrarySetActionMenu
            set={set}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        </div>

        {set.description && (
          <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs">
            {set.description}
          </p>
        )}
      </div>

      {/* Bottom stats & progress */}
      <div className="border-border/50 mt-5 flex flex-col gap-3 border-t pt-3">
        <LibrarySetProgressBar percentage={percentage} />

        <div className="flex items-center justify-between">
          <span className="text-foreground text-xs font-semibold">
            {set.cardCount} thẻ
          </span>

          <Link
            href={`/sets/${set.id}`}
            className="bg-primary/10 hover:bg-primary/20 text-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            <Play className="size-3 fill-current" />
            <span>Học ngay</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
