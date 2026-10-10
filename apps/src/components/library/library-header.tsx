"use client"

import * as React from "react"
import { Layers, GitMerge, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Sub-component tiêu đề và mô tả của trang Thư viện
 */
export function LibraryHeaderTitle() {
  return (
    <div>
      <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
        <Layers className="text-primary size-6" />
        <span>Thư viện bộ thẻ</span>
      </h1>
      <p className="text-muted-foreground mt-1 text-xs">
        Quản lý, tổ chức và ôn tập toàn bộ các bộ thẻ từ vựng và Kanji của bạn.
      </p>
    </div>
  )
}

interface LibraryHeaderActionsProps {
  onOpenMergeModal: () => void
  onOpenCreateModal: () => void
}

/**
 * Sub-component nhóm nút thao tác đầu trang (Gộp bộ thẻ, Tạo bộ thẻ)
 */
export function LibraryHeaderActions({
  onOpenMergeModal,
  onOpenCreateModal,
}: LibraryHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onOpenMergeModal}>
        <GitMerge
          data-icon="inline-start"
          className="size-3.5 text-purple-500"
        />
        <span>Gộp bộ thẻ</span>
      </Button>

      <Button
        size="sm"
        onClick={onOpenCreateModal}
        className="shadow-primary/20 shadow-xs"
      >
        <Plus data-icon="inline-start" className="size-4" />
        <span>Tạo bộ thẻ</span>
      </Button>
    </div>
  )
}

export interface LibraryHeaderProps {
  onOpenMergeModal: () => void
  onOpenCreateModal: () => void
}

export function LibraryHeader({
  onOpenMergeModal,
  onOpenCreateModal,
}: LibraryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <LibraryHeaderTitle />
      <LibraryHeaderActions
        onOpenMergeModal={onOpenMergeModal}
        onOpenCreateModal={onOpenCreateModal}
      />
    </div>
  )
}
