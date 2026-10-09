"use client"

import * as React from "react"
import { Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MistakesHeaderProps {
  totalCount: number
  isFilterPending: boolean
  onLaunchReview: () => void
}

export function MistakesHeader({
  totalCount,
  isFilterPending,
  onLaunchReview,
}: MistakesHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
            ⭐ Error Pool
          </span>
          <span className="text-muted-foreground text-xs font-medium">
            {totalCount} thẻ cần củng cố
          </span>
          {isFilterPending && (
            <Loader2 className="text-primary size-3.5 animate-spin" />
          )}
        </div>

        <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
          Ôn tập lỗi sai (Mistakes Pool)
        </h1>
        <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
          Kho lưu trữ những thẻ từ vựng bạn đã từng trả lời sai trong tất cả các
          chế độ học. Tập trung ôn luyện những điểm yếu này để nhanh chóng tăng
          độ chính xác!
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={onLaunchReview}
          disabled={totalCount === 0}
          className="gap-2 rounded-2xl bg-rose-600 px-6 py-5 text-sm font-bold text-white shadow-md hover:bg-rose-700"
        >
          <Play className="size-4 fill-current" />
          <span>Ôn tập ngay ({totalCount})</span>
        </Button>
      </div>
    </div>
  )
}
