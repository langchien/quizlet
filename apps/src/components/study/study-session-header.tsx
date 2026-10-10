"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { StudyHeaderExit } from "./study-header-exit"
import { StudyHeaderProgress } from "./study-header-progress"
import { StudyHeaderModeBadge } from "./study-header-mode-badge"

export interface StudySessionHeaderProps {
  /** ID của bộ thẻ để liên kết nút thoát */
  setId: string
  /** URL thoát tùy biến (mặc định: `/sets/${setId}`) */
  exitHref?: string
  /** Nhãn nút thoát (mặc định: "Thoát") */
  exitLabel?: string
  /** Tên bộ thẻ hiển thị nếu có */
  setName?: string
  /** Vị trí câu hỏi hiện tại (bắt đầu từ 1 hoặc index+1) */
  current?: number
  /** Tổng số câu hỏi/thẻ */
  total?: number
  /** Phần trăm tiến độ tùy biến (nếu không truyền sẽ tự tính từ current / total) */
  progressPct?: number
  /** Màu của thanh tiến độ (mặc định: bg-primary) */
  progressColor?: string
  /** Nhãn đếm đi kèm (ví dụ: "đã thuộc", "cặp", v.v.) */
  counterLabel?: string
  /** Nhãn chế độ học (icon, text, màu sắc) */
  modeBadge?: {
    icon?: React.ReactNode
    label: string
    className?: string
  }
  /** Nội dung tùy biến vùng trung tâm (ví dụ đồng hồ đếm giờ Match) */
  centerContent?: React.ReactNode
  /** Các nút thao tác góc phải (Shuffle, Reverse, Cheatsheet, Fullscreen, v.v.) */
  rightActions?: React.ReactNode
  /** Thêm class tùy biến cho container */
  className?: string
}

export function StudySessionHeader({
  setId,
  exitHref,
  exitLabel = "Thoát",
  setName,
  current,
  total,
  progressPct,
  progressColor = "bg-primary",
  counterLabel,
  modeBadge,
  centerContent,
  rightActions,
  className,
}: StudySessionHeaderProps) {
  // Tính toán phần trăm tiến độ nếu có current & total
  const calculatedProgress = React.useMemo(() => {
    if (typeof progressPct === "number")
      return Math.min(100, Math.max(0, progressPct))
    if (typeof current === "number" && typeof total === "number" && total > 0) {
      return Math.min(100, Math.max(0, Math.round((current / total) * 100)))
    }
    return 0
  }, [progressPct, current, total])

  const hasProgress =
    typeof current === "number" && typeof total === "number" && total > 0

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 select-none",
        className
      )}
    >
      {/* Vùng trái: Nút Thoát & Tên bộ thẻ */}
      <StudyHeaderExit
        exitHref={exitHref || `/sets/${setId}`}
        exitLabel={exitLabel}
        setName={setName}
      />

      {/* Vùng trung tâm: Thanh tiến độ hoặc custom center content */}
      {centerContent ? (
        <div className="flex flex-1 items-center justify-center">
          {centerContent}
        </div>
      ) : hasProgress && current !== undefined && total !== undefined ? (
        <StudyHeaderProgress
          current={current}
          total={total}
          calculatedProgress={calculatedProgress}
          progressColor={progressColor}
          counterLabel={counterLabel}
        />
      ) : null}

      {/* Vùng phải: Mode badge hoặc Action buttons */}
      <div className="flex shrink-0 items-center gap-1">
        {modeBadge && (
          <StudyHeaderModeBadge
            icon={modeBadge.icon}
            label={modeBadge.label}
            className={modeBadge.className}
          />
        )}
        {rightActions}
      </div>
    </div>
  )
}
