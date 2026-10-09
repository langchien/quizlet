"use client"

import * as React from "react"
import { Search, Tag as TagIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SetCardsToolbarProps {
  totalCards: number
  selectedCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
  onBulkTag: () => void
  onBulkDelete: () => void
}

export function SetCardsToolbar({
  totalCards,
  selectedCount,
  searchQuery,
  onSearchChange,
  onBulkTag,
  onBulkDelete,
}: SetCardsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-foreground text-base font-bold">
          Danh sách thẻ ({totalCards})
        </h2>
        {selectedCount > 0 && (
          <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
            Đã chọn {selectedCount} thẻ
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Search inside set */}
        <div className="relative min-w-[200px]">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Tìm thẻ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        {/* Bulk Action Buttons */}
        {selectedCount > 0 && (
          <div className="animate-in fade-in-0 flex items-center gap-1.5 duration-150">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkTag}
              className="h-8 gap-1 text-xs"
            >
              <TagIcon className="size-3.5 text-purple-500" />
              <span>Gán nhãn</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              className="h-8 gap-1 text-xs"
            >
              <Trash2 className="size-3.5" />
              <span>Xoá ({selectedCount})</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
