"use client"

import * as React from "react"
import {
  Plus,
  Folder,
  Layers,
  Tag,
  Calendar,
  BarChart2,
  Sparkles,
} from "lucide-react"

interface CommandQuickActionsProps {
  onSelect: (url: string) => void
  onOpenCreateSet?: () => void
  onOpenCreateFolder?: () => void
}

export function CommandQuickActions({
  onSelect,
  onOpenCreateSet,
  onOpenCreateFolder,
}: CommandQuickActionsProps) {
  return (
    <div>
      <div className="text-muted-foreground px-2 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
        Thao tác nhanh
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {onOpenCreateSet && (
          <button
            type="button"
            onClick={onOpenCreateSet}
            className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
          >
            <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg">
              <Plus className="size-4" />
            </div>
            <span>Tạo bộ thẻ mới</span>
          </button>
        )}
        {onOpenCreateFolder && (
          <button
            type="button"
            onClick={onOpenCreateFolder}
            className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Folder className="size-4" />
            </div>
            <span>Tạo thư mục mới</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onSelect("/library")}
          className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
            <Layers className="size-4" />
          </div>
          <span>Thư viện bộ thẻ</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect("/tags")}
          className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Tag className="size-4" />
          </div>
          <span>Quản lý nhãn</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect("/calendar")}
          className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Calendar className="size-4" />
          </div>
          <span>Lịch ôn tập</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect("/stats")}
          className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
            <BarChart2 className="size-4" />
          </div>
          <span>Thống kê tiến độ</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect("/import-export")}
          className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
            <Sparkles className="size-4" />
          </div>
          <span>Nhập / Xuất dữ liệu</span>
        </button>
      </div>
    </div>
  )
}
