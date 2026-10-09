"use client"

import * as React from "react"
import Link from "next/link"
import { Folder, MoreVertical, Edit2, Copy, Trash2, Play } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { LibraryStudySetItem } from "@/types/library"

interface LibrarySetCardProps {
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
  const pct = set.progress?.percentage || 0

  return (
    <div className="group border-border bg-card hover:border-primary/40 relative flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-md">
      <div>
        {/* Top info */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {set.folder && (
              <span className="mb-2 inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">
                <Folder className="size-3" />
                <span>{set.folder.name}</span>
              </span>
            )}
            <Link
              href={`/sets/${set.id}`}
              className="text-foreground group-hover:text-primary line-clamp-1 block text-base font-bold transition-colors"
            >
              {set.name}
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1">
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
                <span>Xoá bộ thẻ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {set.description && (
          <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs">
            {set.description}
          </p>
        )}
      </div>

      {/* Bottom stats & progress */}
      <div className="border-border/50 mt-5 flex flex-col gap-3 border-t pt-3">
        {/* Progress bar */}
        <div className="flex flex-col gap-1">
          <div className="text-muted-foreground flex justify-between text-[11px]">
            <span>Tiến độ ghi nhớ</span>
            <span className="text-foreground font-semibold">{pct}%</span>
          </div>
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

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
