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
import { StudySessionHeader } from "@/components/study/study-session-header"
import { FlashcardHeaderAction } from "./flashcard-header-action"

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
          <FlashcardHeaderAction
            icon={<Shuffle className="size-4" />}
            title="Xáo trộn thứ tự"
            isActive={isShuffle}
            onClick={onToggleShuffle}
          />

          <FlashcardHeaderAction
            icon={<Rotate3D className="size-4" />}
            title="Đổi mặt thẻ (Hỏi định nghĩa trước)"
            isActive={isReverse}
            onClick={onToggleReverse}
          />

          <FlashcardHeaderAction
            icon={
              isAutoPlay ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )
            }
            title="Tự động phát thẻ (Auto-play)"
            isActive={isAutoPlay}
            activeClassName="bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400"
            onClick={onToggleAutoPlay}
          />

          <FlashcardHeaderAction
            icon={<Keyboard className="size-4" />}
            title="Bảng phím tắt (?)"
            onClick={onOpenCheatsheet}
          />

          <FlashcardHeaderAction
            icon={
              isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )
            }
            title="Toàn màn hình"
            onClick={onToggleFullscreen}
          />
        </div>
      }
    />
  )
}
