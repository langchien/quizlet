"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical, Edit2, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { TagWithCount } from "@/lib/dal/tags"

interface TagCardHeaderProps {
  tag: TagWithCount
  onEdit: (tag: TagWithCount) => void
  onDelete: (tag: TagWithCount) => void
}

export function TagCardHeader({ tag, onEdit, onDelete }: TagCardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <Link
        href={`/tags/${tag.id}`}
        className="flex flex-1 items-center gap-2.5 overflow-hidden"
      >
        <div
          className="size-3.5 shrink-0 rounded-full ring-2 ring-white/20 transition-transform group-hover:scale-110"
          style={{ backgroundColor: tag.color || "#3B82F6" }}
        />
        <span className="text-foreground group-hover:text-primary truncate text-sm font-semibold transition-colors">
          {tag.name}
        </span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground hover:bg-muted/60 flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors">
          <MoreVertical className="size-3.5" />
          <span className="sr-only">Tác vụ nhãn</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onClick={() => onEdit(tag)}
            className="cursor-pointer gap-2 text-xs"
          >
            <Edit2 className="size-3.5" />
            <span>Chỉnh sửa</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(tag)}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2 text-xs"
          >
            <Trash2 className="size-3.5" />
            <span>Xoá nhãn</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
