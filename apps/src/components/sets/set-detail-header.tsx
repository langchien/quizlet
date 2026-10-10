"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ChevronRight,
  Play,
  Edit2,
  Plus,
  Folder,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { SetDetailData } from "@/types/set-detail"

interface SetDetailBreadcrumbProps {
  name: string
  folder?: { id: string; name: string } | null
}

/**
 * Sub-component đường dẫn phân cấp (Breadcrumb) quay lại Thư viện
 */
export function SetDetailBreadcrumb({
  name,
  folder,
}: SetDetailBreadcrumbProps) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-xs">
      <Link
        href="/library"
        className="hover:text-foreground flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Thư viện</span>
      </Link>
      {folder && (
        <>
          <ChevronRight className="size-3" />
          <Link
            href={`/library?folderId=${folder.id}`}
            className="hover:text-foreground transition-colors"
          >
            📁 {folder.name}
          </Link>
        </>
      )}
      <ChevronRight className="size-3" />
      <span className="text-foreground max-w-xs truncate font-semibold">
        {name}
      </span>
    </div>
  )
}

interface SetDetailBadgesProps {
  cardCount: number
  folder?: { id: string; name: string } | null
}

/**
 * Sub-component hiển thị nhãn số lượng thẻ và thư mục
 */
export function SetDetailBadges({ cardCount, folder }: SetDetailBadgesProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className="bg-primary/10 text-primary font-semibold"
      >
        {cardCount} thẻ từ vựng
      </Badge>
      {folder && (
        <Badge
          variant="secondary"
          className="gap-1 bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400"
        >
          <Folder className="size-3" />
          <span>{folder.name}</span>
        </Badge>
      )}
    </div>
  )
}

interface SetDetailActionsProps {
  setId: string
  onEditSet: () => void
  onAddCard: () => void
}

/**
 * Sub-component các nút thao tác đầu trang bộ thẻ (Học, Sửa, Thêm thẻ)
 */
export function SetDetailActions({
  setId,
  onEditSet,
  onAddCard,
}: SetDetailActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/study/${setId}`}>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-xs"
        >
          <Play data-icon="inline-start" className="size-3.5 fill-current" />
          <span>Bắt đầu học</span>
        </Button>
      </Link>

      <Button variant="outline" size="sm" onClick={onEditSet}>
        <Edit2 data-icon="inline-start" className="size-3.5" />
        <span>Sửa</span>
      </Button>

      <Button variant="outline" size="sm" onClick={onAddCard}>
        <Plus data-icon="inline-start" className="size-3.5" />
        <span>Thêm thẻ</span>
      </Button>
    </div>
  )
}

interface SetProgressStatItemProps {
  label: string
  value: React.ReactNode
  textColor?: string
  unit?: string
}

/**
 * Sub-component hiển thị từng ô thống kê trạng thái học
 */
export function SetProgressStatItem({
  label,
  value,
  textColor = "text-foreground",
  unit,
}: SetProgressStatItemProps) {
  return (
    <div className="border-border/60 bg-background/50 flex flex-col gap-0.5 rounded-2xl border p-3">
      <span className="text-muted-foreground text-[11px] font-medium">
        {label}
      </span>
      <div className={`text-lg font-bold ${textColor}`}>
        {value}{" "}
        {unit && (
          <span className="text-muted-foreground text-xs font-normal">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

interface SetProgressSummaryProps {
  progress?: {
    mastered: number
    learning: number
    new: number
    percentage: number
  }
}

/**
 * Sub-component tóm tắt tiến độ 4 chỉ số SRS
 */
export function SetProgressSummary({ progress }: SetProgressSummaryProps) {
  const percentage = progress?.percentage || 0

  return (
    <div className="border-border/60 mt-6 grid grid-cols-2 gap-3 border-t pt-6 sm:grid-cols-4">
      <SetProgressStatItem
        label="Đã thành thục (Mastered)"
        value={progress?.mastered || 0}
        textColor="text-emerald-500"
        unit="thẻ"
      />
      <SetProgressStatItem
        label="Đang học (Learning)"
        value={progress?.learning || 0}
        textColor="text-amber-500"
        unit="thẻ"
      />
      <SetProgressStatItem
        label="Thẻ mới (New)"
        value={progress?.new || 0}
        textColor="text-blue-500"
        unit="thẻ"
      />
      <SetProgressStatItem label="Tỷ lệ ghi nhớ" value={`${percentage}%`} />
    </div>
  )
}

export interface SetDetailHeaderProps {
  set: SetDetailData
  onEditSet: () => void
  onAddCard: () => void
}

export function SetDetailHeader({
  set,
  onEditSet,
  onAddCard,
}: SetDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      <SetDetailBreadcrumb name={set.name} folder={set.folder} />

      <div className="border-border from-card via-card to-muted/20 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-2">
            <SetDetailBadges cardCount={set.cardCount} folder={set.folder} />

            <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              {set.name}
            </h1>

            {set.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {set.description}
              </p>
            )}
          </div>

          <SetDetailActions
            setId={set.id}
            onEditSet={onEditSet}
            onAddCard={onAddCard}
          />
        </div>

        <SetProgressSummary progress={set.progress} />
      </div>
    </div>
  )
}
