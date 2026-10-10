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

interface TagCardProps {
  tag: TagWithCount
  onEdit: (tag: TagWithCount) => void
  onDelete: (tag: TagWithCount) => void
}

export function TagCard({ tag, onEdit, onDelete }: TagCardProps) {
  return (
    <div className="group border-border bg-card hover:border-border/80 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-2xs transition-all hover:shadow-md">
      {/* Top Row: Color indicator, name & actions */}
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/tags/${tag.id}`}
          className="flex flex-1 items-center gap-2.5 overflow-hidden"
        >
          <div
            className="size-3.5 shrink-0 rounded-full ring-2 ring-white/20 transition-transform group-hover:scale-110"
            style={{ backgroundColor: tag.color || "#3B82F6" }}
          />
          <span className="text-foreground truncate text-sm font-semibold transition-colors group-hover:text-purple-500">
            {tag.name}
          </span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground hover:bg-muted/60 flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors">
            <MoreVertical className="size-3.5" />
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
              className="cursor-pointer gap-2 text-xs text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/20"
            >
              <Trash2 className="size-3.5" />
              <span>Xoá nhãn</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bottom Row: Stats & View Link */}
      <div className="border-border/40 mt-4 flex items-center justify-between border-t pt-3">
        <span className="text-muted-foreground text-xs font-medium">
          {tag.cardCount} thẻ liên kết
        </span>

        <Link
          href={`/tags/${tag.id}`}
          className="text-xs font-medium text-purple-500 transition-colors hover:text-purple-600 hover:underline"
        >
          Xem thẻ &rarr;
        </Link>
      </div>
    </div>
  )
}
