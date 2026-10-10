"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, Folder as FolderIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface SetDetailOverview {
  id: string
  name: string
  description?: string | null
  cardCount: number
  folder?: { id: string; name: string } | null
  progress?: {
    mastered: number
    learning: number
    new: number
    percentage: number
  }
}

interface StudyModeHeaderProps {
  setDetail: SetDetailOverview
}

export function StudyModeHeader({ setDetail }: StudyModeHeaderProps) {
  const pct = setDetail.progress?.percentage || 0

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Back */}
      <div className="flex items-center justify-between">
        <Link
          href={`/sets/${setDetail.id}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ChevronLeft className="size-4" />
          <span>Về trang bộ thẻ</span>
        </Link>

        {setDetail.folder && (
          <Badge variant="outline" className="text-xs font-semibold">
            <FolderIcon className="mr-1 size-3" />
            <span>{setDetail.folder.name}</span>
          </Badge>
        )}
      </div>

      {/* Header Set Overview Card */}
      <div className="border-border from-card via-card to-muted/20 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary rounded-md px-2.5 py-0.5 text-xs font-bold">
                {setDetail.cardCount} thẻ từ vựng
              </span>
              <span className="text-muted-foreground text-xs font-medium">
                • Tiến độ: <b className="text-foreground">{pct}%</b>
              </span>
            </div>

            <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
              {setDetail.name}
            </h1>

            {setDetail.description && (
              <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed">
                {setDetail.description}
              </p>
            )}
          </div>

          {/* Quick Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-muted-foreground text-[11px] font-semibold">
                Tỷ lệ thuộc bài
              </div>
              <div className="text-foreground text-2xl font-black">{pct}%</div>
            </div>
            <div className="bg-muted h-3 w-28 overflow-hidden rounded-full sm:w-36">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
