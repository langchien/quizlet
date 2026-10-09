"use client"

import * as React from "react"
import { Plus } from "lucide-react"

interface SidebarCreateButtonProps {
  onOpenCreateSet: () => void
}

export function SidebarCreateButton({
  onOpenCreateSet,
}: SidebarCreateButtonProps) {
  return (
    <div className="border-border/50 border-t p-3">
      <button
        type="button"
        onClick={onOpenCreateSet}
        className="bg-primary/10 hover:bg-primary/20 text-primary flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
      >
        <Plus className="size-4" />
        <span>Tạo bộ thẻ mới</span>
      </button>
    </div>
  )
}
