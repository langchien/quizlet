"use client"

import * as React from "react"
import {
  Shuffle,
  Rotate3D,
  Play,
  Pause,
  Keyboard,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { StudySessionHeader } from "@/components/study/study-session-header"

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
  return (
    <StudySessionHeader
      setId={setId}
      current={currentIndex + 1}
      total={totalCards}
      progressColor="bg-primary"
      rightActions={
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
      }
    />
  )
}
