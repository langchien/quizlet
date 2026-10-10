"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TagsHeaderTitle } from "./tags-header-title"

interface TagsHeaderProps {
  onCreateClick: () => void
}

export function TagsHeader({ onCreateClick }: TagsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <TagsHeaderTitle />

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
