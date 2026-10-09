"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronLeft,
  Shuffle,
  Rotate3D,
  Play,
  Pause,
  Keyboard,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FlashcardHeaderProps {
  setId: string
  currentIndex: number
  totalCards: number
  isShuffle: boolean
  onToggleShuffle: () => void
  isReverse: boolean
  onToggleReverse: () => void
  isAutoPlay: boolean
  onToggleAutoPlay: () => void
  onOpenCheatsheet: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

export function FlashcardHeader({
  setId,
  currentIndex,
  totalCards,
  isShuffle,
  onToggleShuffle,
  isReverse,
  onToggleReverse,
  isAutoPlay,
  onToggleAutoPlay,
  onOpenCheatsheet,
  isFullscreen,
  onToggleFullscreen,
}: FlashcardHeaderProps) {
  const progressPct =
    totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0

  return (
    <div className="flex items-center justify-between">
      {/* Nút thoát */}
      <Link
        href={`/sets/${setId}`}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-semibold transition-colors"
      >
        <ChevronLeft className="size-4" />
        <span>Thoát</span>
      </Link>

      {/* Tiến độ học */}
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground text-xs font-bold">
          <span className="text-foreground text-sm font-black">
            {currentIndex + 1}
          </span>{" "}
          / {totalCards}
        </div>
        <div className="bg-muted h-2 w-32 overflow-hidden rounded-full sm:w-48">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Các nút công cụ */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleShuffle}
          className={cn(
            "rounded-lg p-2 transition-colors",
            isShuffle
              ? "bg-primary/10 text-primary font-bold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          title="Xáo trộn thứ tự"
        >
          <Shuffle className="size-4" />
        </button>

        <button
          type="button"
          onClick={onToggleReverse}
          className={cn(
            "rounded-lg p-2 transition-colors",
            isReverse
              ? "bg-primary/10 text-primary font-bold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          title="Đổi mặt thẻ (Hỏi định nghĩa trước)"
        >
          <Rotate3D className="size-4" />
        </button>

        <button
          type="button"
          onClick={onToggleAutoPlay}
          className={cn(
            "rounded-lg p-2 transition-colors",
            isAutoPlay
              ? "bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          title="Tự động phát thẻ (Auto-play)"
        >
          {isAutoPlay ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onOpenCheatsheet}
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
          title="Bảng phím tắt (?)"
        >
          <Keyboard className="size-4" />
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
          title="Toàn màn hình"
        >
          {isFullscreen ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </button>
      </div>
    </div>
  )
}
