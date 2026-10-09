"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpen,
  Layers,
  Folder,
  Tag,
  Plus,
  Play,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore"

interface SetSummary {
  id: string
  name: string
  description?: string | null
  cardCount: number
  updatedAt: string
  folder?: { id: string; name: string } | null
  progress?: {
    percentage: number
  }
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [sets, setSets] = React.useState<SetSummary[]>([])
  const [totalSets, setTotalSets] = React.useState(0)
  const [totalFolders, setTotalFolders] = React.useState(0)
  const [totalTags, setTotalTags] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      fetch("/api/sets?limit=6").then((r) =>
        r.ok ? r.json() : { items: [], total: 0 }
      ),
      fetch("/api/folders").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/tags").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([setsData, foldersData, tagsData]) => {
        setSets(setsData.items || [])
        setTotalSets(setsData.total || 0)
        setTotalFolders(foldersData.length || 0)
        setTotalTags(tagsData.length || 0)
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false))
  }, [])

  const totalCards = sets.reduce((acc, curr) => acc + curr.cardCount, 0)

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="border-border from-primary/10 via-card to-card relative overflow-hidden rounded-3xl border bg-gradient-to-r p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl space-y-1">
            <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
              <Sparkles className="size-3.5" />
              <span>Sẵn sàng chinh phục tiếng Nhật hôm nay</span>
            </div>
            <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              Xin chào, {user?.name || "Bạn"}! 👋
            </h1>
            <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
              Hãy tiếp tục lộ trình học tập, mở các bộ thẻ từ vựng hoặc kiểm tra
              lại tiến độ ghi nhớ theo phương pháp SRS.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/library"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
            >
              <BookOpen className="size-4" />
              <span>Vào Thư viện</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="border-border bg-card rounded-2xl border p-4 shadow-2xs">
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="text-xs font-medium">Tổng số bộ thẻ</span>
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-xl">
              <Layers className="size-4" />
            </div>
          </div>
          <div className="text-foreground mt-2 text-2xl font-extrabold">
            {totalSets}
          </div>
          <div className="text-muted-foreground mt-0.5 text-[11px]">
            bộ thẻ đã tạo
          </div>
        </div>

        <div className="border-border bg-card rounded-2xl border p-4 shadow-2xs">
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="text-xs font-medium">Tổng số thẻ từ vựng</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <BookOpen className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-500">
            {totalCards}
          </div>
          <div className="text-muted-foreground mt-0.5 text-[11px]">
            thẻ trong thư viện
          </div>
        </div>

        <div className="border-border bg-card rounded-2xl border p-4 shadow-2xs">
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="text-xs font-medium">Thư mục tổ chức</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Folder className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-500">
            {totalFolders}
          </div>
          <div className="text-muted-foreground mt-0.5 text-[11px]">
            thư mục phân cấp
          </div>
        </div>

        <div className="border-border bg-card rounded-2xl border p-4 shadow-2xs">
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="text-xs font-medium">Nhãn phân loại</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Tag className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-purple-500">
            {totalTags}
          </div>
          <div className="text-muted-foreground mt-0.5 text-[11px]">
            nhãn đang sử dụng
          </div>
        </div>
      </div>

      {/* Recent Study Sets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-base font-bold">
              Bộ thẻ gần đây
            </h2>
            <p className="text-muted-foreground text-xs">
              Các bộ thẻ được cập nhật hoặc tạo mới gần đây nhất của bạn
            </p>
          </div>
          <Link
            href="/library"
            className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-border bg-card/40 h-36 animate-pulse rounded-2xl border"
              />
            ))}
          </div>
        ) : sets.length === 0 ? (
          <div className="border-border rounded-2xl border border-dashed py-12 text-center">
            <BookOpen className="text-muted-foreground mx-auto mb-2 size-8 opacity-50" />
            <p className="text-muted-foreground text-xs">
              Bạn chưa có bộ thẻ nào. Hãy truy cập Thư viện để tạo bộ thẻ đầu
              tiên!
            </p>
            <Link
              href="/library"
              className="bg-primary text-primary-foreground mt-3 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold"
            >
              <Plus className="size-3.5" />
              <span>Tạo bộ thẻ ngay</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sets.map((set) => (
              <Link
                key={set.id}
                href={`/sets/${set.id}`}
                className="group border-border bg-card hover:border-primary/40 relative flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-md"
              >
                <div>
                  {set.folder && (
                    <span className="mb-1.5 inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-500">
                      📁 {set.folder.name}
                    </span>
                  )}
                  <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-sm font-bold transition-colors">
                    {set.name}
                  </h3>
                  {set.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                      {set.description}
                    </p>
                  )}
                </div>

                <div className="border-border/50 mt-4 flex items-center justify-between border-t pt-3 text-xs">
                  <span className="text-foreground font-semibold">
                    {set.cardCount} thẻ
                  </span>
                  <span className="text-primary inline-flex items-center gap-1 text-[11px] font-semibold transition-transform group-hover:translate-x-0.5">
                    <span>Học ngay</span>
                    <Play className="size-2.5 fill-current" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
