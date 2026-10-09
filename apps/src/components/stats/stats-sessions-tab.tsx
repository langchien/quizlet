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
import type { SessionsHistoryResponse } from "@/schemas/stats"

const STUDY_MODE_CONFIG: Record<
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

interface StatsSessionsTabProps {
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-foreground text-sm font-bold">
            Nhật ký tất cả các phiên học tập
            {isSessionPending && (
              <Loader2 className="text-primary ml-2 inline-block size-4 animate-spin" />
            )}
          </h3>
          <p className="text-muted-foreground text-xs">
            Tổng cộng {sessionsData?.pagination.total ?? 0} phiên học được lưu
            trong hệ thống
          </p>
        </div>

        {/* Bộ lọc Mode */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">
            Chế độ:
          </span>
          <select
            value={selectedModeFilter}
            onChange={(e) => onModeChange(e.target.value)}
            disabled={isSessionPending}
            className="bg-card border-border text-foreground rounded-xl border px-3 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">Tất cả chế độ</option>
            <option value="Flashcard">🃏 Flashcard</option>
            <option value="Learn">📖 Học thích ứng</option>
            <option value="Test">📝 Kiểm tra</option>
            <option value="Match">🧩 Ghép từ</option>
            <option value="Write">✍️ Viết đáp án</option>
            <option value="Listen">🎧 Nghe & viết</option>
          </select>
        </div>
      </div>

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
              sessionsData.sessions.map((s) => {
                const modeMeta = STUDY_MODE_CONFIG[s.mode] || {
                  label: s.mode,
                  icon: "📚",
                  color: "text-foreground",
                }
                const formattedDate = new Date(s.startedAt).toLocaleDateString(
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
                  <TableRow key={s.id} className="hover:bg-muted/30">
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
                        {s.studySet?.name || "Luyện tập tự do"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-xs">
                        {formattedDate}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-xs">
                        {Math.round(s.duration / 60)} phút ({s.duration}s)
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-foreground text-xs font-medium">
                        {s.correctCards} / {s.totalCards} thẻ
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          s.score >= 80
                            ? "default"
                            : s.score >= 50
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs font-bold"
                      >
                        {Math.round(s.score)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
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

        {/* Phân trang */}
        {sessionsData && sessionsData.pagination.totalPages > 1 && (
          <div className="border-border/50 flex items-center justify-between border-t px-6 py-4">
            <span className="text-muted-foreground text-xs">
              Trang {sessionsData.pagination.page} /{" "}
              {sessionsData.pagination.totalPages}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={sessionPage <= 1 || isSessionPending}
                onClick={() => onPageChange(Math.max(1, sessionPage - 1))}
                className="gap-1 rounded-xl text-xs"
              >
                <ChevronLeft className="size-3.5" />
                <span>Trước</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  sessionPage >= sessionsData.pagination.totalPages ||
                  isSessionPending
                }
                onClick={() =>
                  onPageChange(
                    Math.min(
                      sessionsData.pagination.totalPages,
                      sessionPage + 1
                    )
                  )
                }
                className="gap-1 rounded-xl text-xs"
              >
                <span>Sau</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
