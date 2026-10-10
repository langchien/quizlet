"use client"

import * as React from "react"
import { Tag as TagIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TagsHeaderProps {
  onCreateClick: () => void
}

export function TagsHeader({ onCreateClick }: TagsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <TagIcon className="size-6 text-purple-500" />
          <span>Quản lý nhãn phân loại</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Gắn nhãn và phân nhóm các thẻ từ vựng xuyên suốt tất cả bộ thẻ.
        </p>
      </div>

      <Button
        size="sm"
        onClick={onCreateClick}
        className="shadow-primary/20 gap-1.5 shadow-xs"
      >
        <Plus className="size-4" />
        <span>Tạo nhãn mới</span>
      </Button>
    </div>
  )
}
