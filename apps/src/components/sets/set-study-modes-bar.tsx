"use client"

import * as React from "react"
import Link from "next/link"
import {
  Play,
  Layers,
  BrainCircuit,
  Pencil,
  CheckSquare,
  Sparkles,
  Headphones,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { StudyModeItem } from "@/types/set-detail"

interface StudyModeButtonProps {
  mode: StudyModeItem
}

/**
 * Sub-component nút chọn chế độ học với hiệu ứng hover và icon gradient
 */
export function StudyModeButton({ mode }: StudyModeButtonProps) {
  return (
    <Link
      href={mode.href}
      className="group border-border bg-card hover:border-primary/50 relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center shadow-2xs transition-all hover:shadow-md"
    >
      <div
        className={cn(
          "mb-2.5 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-xs transition-transform group-hover:scale-110",
          mode.color
        )}
      >
        <mode.icon className="size-5" />
      </div>
      <span className="text-foreground group-hover:text-primary text-xs font-bold transition-colors">
        {mode.title}
      </span>
      <span className="text-muted-foreground mt-0.5 text-[10px]">
        {mode.desc}
      </span>
    </Link>
  )
}

export interface SetStudyModesBarProps {
  setId: string
}

export function SetStudyModesBar({ setId }: SetStudyModesBarProps) {
  const studyModes: StudyModeItem[] = [
    {
      title: "Flashcard",
      desc: "Lật thẻ ôn tập 3D",
      icon: Layers,
      href: `/study/${setId}/flashcard`,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Learn (Học)",
      desc: "Trắc nghiệm & Thích ứng",
      icon: BrainCircuit,
      href: `/study/${setId}/learn`,
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Viết (Write)",
      desc: "Gõ từ vựng tiếng Nhật",
      icon: Pencil,
      href: `/study/${setId}/write`,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Kiểm tra (Test)",
      desc: "Bài test tính giờ",
      icon: CheckSquare,
      href: `/study/${setId}/test`,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Ghép đôi (Match)",
      desc: "Trò chơi ghép nhanh",
      icon: Sparkles,
      href: `/study/${setId}/match`,
      color: "from-rose-500 to-red-600",
    },
    {
      title: "Luyện nghe (Listen)",
      desc: "Nghe phát âm & gõ lại",
      icon: Headphones,
      href: `/study/${setId}/listen`,
      color: "from-cyan-500 to-blue-600",
    },
  ]

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
          <Play className="text-primary size-4 fill-current" />
          <span>Chọn chế độ học tập</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {studyModes.map((mode) => (
          <StudyModeButton key={mode.title} mode={mode} />
        ))}
      </div>
    </section>
  )
}
