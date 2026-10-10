"use client"

import * as React from "react"
import { MoreVertical, Edit2, Copy, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { LibraryStudySetItem } from "@/types/library"

export interface LibrarySetActionMenuProps {
  set: LibraryStudySetItem
  onEdit: (set: LibraryStudySetItem) => void
  onDuplicate: (id: string, name: string) => void
  onDelete: (set: LibraryStudySetItem) => void
  triggerClassName?: string
}

/**
 * Sub-component menu thao tác nhanh cho từng bộ thẻ (Chỉnh sửa, Nhân bản, Xoá)
 * Tái sử dụng đồng nhất giữa Grid View và List View
 */
export function LibrarySetActionMenu({
  set,
  onEdit,
  onDuplicate,
  onDelete,
  triggerClassName,
}: LibrarySetActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg p-1 transition-colors",
          triggerClassName
        )}
        aria-label="Tùy chọn bộ thẻ"
      >
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onEdit(set)}>
          <Edit2 data-icon="inline-start" className="size-3.5" />
          <span>Chỉnh sửa</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate(set.id, set.name)}>
          <Copy data-icon="inline-start" className="size-3.5" />
          <span>Nhân bản</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(set)}>
          <Trash2 data-icon="inline-start" className="size-3.5" />
          <span>Xoá bộ thẻ</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
