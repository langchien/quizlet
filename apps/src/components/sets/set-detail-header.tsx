"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Play, Edit2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SetDetailData } from "@/types/set-detail"

interface SetDetailHeaderProps {
  set: SetDetailData
  onEditSet: () => void
  onAddCard: () => void
}

export function SetDetailHeader({
  set,
  onEditSet,
  onAddCard,
}: SetDetailHeaderProps) {
  const percentage = set.progress?.percentage || 0

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb & Navigation Back */}
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <Link
          href="/library"
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Thư viện</span>
        </Link>
        {set.folder && (
          <>
            <ChevronRight className="size-3" />
            <Link
              href={`/library?folderId=${set.folder.id}`}
              className="hover:text-foreground transition-colors"
            >
              📁 {set.folder.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3" />
        <span className="text-foreground max-w-xs truncate font-semibold">
          {set.name}
        </span>
      </div>

      {/* Header Overview Card */}
      <div className="border-border from-card via-card to-muted/20 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary rounded-md px-2.5 py-1 text-xs font-semibold">
                {set.cardCount} thẻ từ vựng
              </span>
              {set.folder && (
                <span className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-500">
                  📁 {set.folder.name}
                </span>
              )}
            </div>

            <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              {set.name}
            </h1>

            {set.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {set.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/study/${set.id}`}>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 font-bold shadow-xs"
              >
                <Play className="size-3.5 fill-current" />
                <span>Bắt đầu học</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={onEditSet}
              className="gap-1.5"
            >
              <Edit2 className="size-3.5" />
              <span>Sửa</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onAddCard}
              className="gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Thêm thẻ</span>
            </Button>
          </div>
        </div>

        {/* Progress Stats Summary */}
        <div className="border-border/60 mt-6 grid grid-cols-2 gap-3 border-t pt-6 sm:grid-cols-4">
          <div className="border-border/60 bg-background/50 flex flex-col gap-0.5 rounded-2xl border p-3">
            <div className="text-muted-foreground text-[11px] font-medium">
              Đã thành thục (Mastered)
            </div>
            <div className="text-lg font-bold text-emerald-500">
              {set.progress?.mastered || 0}{" "}
              <span className="text-muted-foreground text-xs font-normal">
                thẻ
              </span>
            </div>
          </div>

          <div className="border-border/60 bg-background/50 flex flex-col gap-0.5 rounded-2xl border p-3">
            <div className="text-muted-foreground text-[11px] font-medium">
              Đang học (Learning)
            </div>
            <div className="text-lg font-bold text-amber-500">
              {set.progress?.learning || 0}{" "}
              <span className="text-muted-foreground text-xs font-normal">
                thẻ
              </span>
            </div>
          </div>

          <div className="border-border/60 bg-background/50 flex flex-col gap-0.5 rounded-2xl border p-3">
            <div className="text-muted-foreground text-[11px] font-medium">
              Thẻ mới (New)
            </div>
            <div className="text-lg font-bold text-blue-500">
              {set.progress?.new || 0}{" "}
              <span className="text-muted-foreground text-xs font-normal">
                thẻ
              </span>
            </div>
          </div>

          <div className="border-border/60 bg-background/50 flex flex-col gap-0.5 rounded-2xl border p-3">
            <div className="text-muted-foreground text-[11px] font-medium">
              Tỷ lệ ghi nhớ
            </div>
            <div className="text-foreground text-lg font-bold">
              {percentage}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
