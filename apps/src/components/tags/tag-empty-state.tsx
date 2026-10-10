"use client"

import * as React from "react"
import { Tag as TagIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TagEmptyStateProps {
  search: string
  onCreateClick: () => void
}

export function TagEmptyState({ search, onCreateClick }: TagEmptyStateProps) {
  return (
    <div className="border-border bg-card/40 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
        <TagIcon className="size-6" />
      </div>
      <h3 className="text-foreground mt-4 text-base font-semibold">
        {search ? "Không tìm thấy nhãn phù hợp" : "Chưa có nhãn nào"}
      </h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-xs">
        {search
          ? `Không có nhãn nào chứa từ khóa "${search}". Thử từ khóa khác.`
          : "Tạo các nhãn phân loại (như N5, N4, Kanji, Ngữ pháp) để dễ dàng gom nhóm và ôn tập thẻ học."}
      </p>
      {!search && (
        <Button
          size="sm"
          onClick={onCreateClick}
          className="mt-5 gap-1.5 text-xs"
        >
          <Plus className="size-3.5" />
          <span>Tạo nhãn đầu tiên</span>
        </Button>
      )}
    </div>
  )
}
