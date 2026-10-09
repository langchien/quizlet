"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Edit2, Copy, Trash2, Play } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { LibraryStudySetItem } from "@/types/library"

interface LibrarySetRowProps {
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
  const pct = set.progress?.percentage || 0

  return (
    <div className="hover:bg-muted/30 group flex flex-col justify-between gap-3 p-4 transition-colors sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/sets/${set.id}`}
            className="text-foreground group-hover:text-primary text-sm font-bold transition-colors"
          >
            {set.name}
          </Link>
          {set.folder && (
            <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-500">
              📁 {set.folder.name}
            </span>
          )}
        </div>
        {set.description && (
          <p className="text-muted-foreground mt-0.5 max-w-xl truncate text-xs">
            {set.description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right">
          <div className="text-foreground text-xs font-semibold">
            {set.cardCount} thẻ
          </div>
          <div className="text-[10px] font-medium text-emerald-500">
            Đã thuộc: {pct}%
          </div>
        </div>

        <Link
          href={`/sets/${set.id}`}
          className="bg-primary/10 hover:bg-primary/20 text-primary inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
        >
          <Play className="size-3 fill-current" />
          <span>Học</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1">
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(set)} className="gap-2">
              <Edit2 className="size-3.5" />
              <span>Chỉnh sửa</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDuplicate(set.id, set.name)}
              className="gap-2"
            >
              <Copy className="size-3.5" />
              <span>Nhân bản</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(set)}
              className="gap-2"
            >
              <Trash2 className="size-3.5" />
              <span>Xoá</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
