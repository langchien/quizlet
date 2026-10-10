"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SessionsHistoryResponse } from "@/schemas/stats"

export const STUDY_MODE_CONFIG: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  Flashcard: { label: "Flashcard", icon: "🃏", color: "text-blue-500" },
  Learn: { label: "Học thích ứng", icon: "📖", color: "text-purple-500" },
  Test: { label: "Kiểm tra", icon: "📝", color: "text-amber-500" },
  Match: { label: "Ghép từ", icon: "🧩", color: "text-pink-500" },
  Write: { label: "Viết đáp án", icon: "✍️", color: "text-emerald-500" },
  Listen: { label: "Nghe & viết", icon: "🎧", color: "text-cyan-500" },
}

interface StatsSessionsHeaderProps {
  totalSessions: number
  isPending: boolean
  selectedMode: string
  onModeChange: (mode: string) => void
}

/**
 * Sub-component phần đầu trang lịch sử phiên học và bộ lọc chế độ
 */
export function StatsSessionsHeader({
  totalSessions,
  isPending,
  selectedMode,
  onModeChange,
}: StatsSessionsHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h3 className="text-foreground text-sm font-bold">
          Nhật ký tất cả các phiên học tập
          {isPending && (
            <Loader2 className="text-primary ml-2 inline-block size-4 animate-spin" />
          )}
        </h3>
        <p className="text-muted-foreground text-xs">
          Tổng cộng {totalSessions} phiên học được lưu trong hệ thống
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">
          Chế độ:
        </span>
        <Select
          value={selectedMode}
          onValueChange={(val) => val && onModeChange(val)}
          disabled={isPending}
        >
          <SelectTrigger className="h-8 w-44 text-xs font-medium">
            <SelectValue placeholder="Tất cả chế độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả chế độ</SelectItem>
            <SelectItem value="Flashcard">🃏 Flashcard</SelectItem>
            <SelectItem value="Learn">📖 Học thích ứng</SelectItem>
            <SelectItem value="Test">📝 Kiểm tra</SelectItem>
            <SelectItem value="Match">🧩 Ghép từ</SelectItem>
            <SelectItem value="Write">✍️ Viết đáp án</SelectItem>
            <SelectItem value="Listen">🎧 Nghe & viết</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

type SessionItem = NonNullable<SessionsHistoryResponse>["sessions"][number]

interface StatsSessionRowProps {
  session: SessionItem
}

/**
 * Sub-component hiển thị từng hàng phiên học trong bảng
 */
export function StatsSessionRow({ session }: StatsSessionRowProps) {
  const modeMeta = STUDY_MODE_CONFIG[session.mode] || {
    label: session.mode,
    icon: "📚",
    color: "text-foreground",
  }
  const formattedDate = new Date(session.startedAt).toLocaleDateString(
    "vi-VN",
    {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  )

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-base">{modeMeta.icon}</span>
          <span className="text-foreground text-xs font-bold">
            {modeMeta.label}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground text-xs font-medium">
          {session.studySet?.name || "Luyện tập tự do"}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground text-xs">{formattedDate}</span>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground text-xs">
          {Math.round(session.duration / 60)} phút ({session.duration}s)
        </span>
      </TableCell>
      <TableCell>
        <span className="text-foreground text-xs font-medium">
          {session.correctCards} / {session.totalCards} thẻ
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Badge
          variant={
            session.score >= 80
              ? "default"
              : session.score >= 50
                ? "secondary"
                : "outline"
          }
          className="text-xs font-bold"
        >
          {Math.round(session.score)}%
        </Badge>
      </TableCell>
    </TableRow>
  )
}

interface StatsSessionsPaginationProps {
  currentPage: number
  totalPages: number
  isPending: boolean
  onPageChange: (page: number) => void
}

/**
 * Sub-component thanh phân trang bảng phiên học
 */
export function StatsSessionsPagination({
  currentPage,
  totalPages,
  isPending,
  onPageChange,
}: StatsSessionsPaginationProps) {
  return (
    <div className="border-border/50 flex items-center justify-between border-t px-6 py-4">
      <span className="text-muted-foreground text-xs">
        Trang {currentPage} / {totalPages}
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1 || isPending}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="rounded-xl text-xs"
        >
          <ChevronLeft data-icon="inline-start" className="size-3.5" />
          <span>Trước</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages || isPending}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="rounded-xl text-xs"
        >
          <span>Sau</span>
          <ChevronRight data-icon="inline-end" className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

export interface StatsSessionsTabProps {
  sessionsData: SessionsHistoryResponse | null
  sessionPage: number
  selectedModeFilter: string
  isSessionPending: boolean
  onModeChange: (mode: string) => void
  onPageChange: (page: number) => void
}

export function StatsSessionsTab({
  sessionsData,
  sessionPage,
  selectedModeFilter,
  isSessionPending,
  onModeChange,
  onPageChange,
}: StatsSessionsTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <StatsSessionsHeader
        totalSessions={sessionsData?.pagination.total ?? 0}
        isPending={isSessionPending}
        selectedMode={selectedModeFilter}
        onModeChange={onModeChange}
      />

      {/* Bảng Danh sách Phiên học */}
      <div
        className={`border-border bg-card overflow-hidden rounded-3xl border shadow-2xs transition-opacity ${isSessionPending ? "opacity-50" : ""}`}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-bold">Chế độ</TableHead>
              <TableHead className="text-xs font-bold">Bộ thẻ</TableHead>
              <TableHead className="text-xs font-bold">Thời gian</TableHead>
              <TableHead className="text-xs font-bold">Thời lượng</TableHead>
              <TableHead className="text-xs font-bold">Số thẻ</TableHead>
              <TableHead className="text-right text-xs font-bold">
                Điểm / Kết quả
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessionsData?.sessions && sessionsData.sessions.length > 0 ? (
              sessionsData.sessions.map((s) => (
                <StatsSessionRow key={s.id} session={s} />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-8 text-center text-xs"
                >
                  Không tìm thấy phiên học nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {sessionsData && sessionsData.pagination.totalPages > 1 && (
          <StatsSessionsPagination
            currentPage={sessionPage}
            totalPages={sessionsData.pagination.totalPages}
            isPending={isSessionPending}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  )
}
