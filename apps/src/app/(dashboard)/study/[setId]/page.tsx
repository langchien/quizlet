"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Layers,
  BrainCircuit,
  Pencil,
  CheckSquare,
  Sparkles,
  Headphones,
  ArrowRight,
  ChevronLeft,
  SlidersHorizontal,
  Folder as FolderIcon,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TagItem {
  id: string
  name: string
  color: string
}

interface SetDetailData {
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

export default function StudyModeSelectionPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.id as string

  const [setDetail, setSetDetail] = React.useState<SetDetailData | null>(null)
  const [tags, setTags] = React.useState<TagItem[]>([])
  const [loading, setLoading] = React.useState(true)

  // Study Options
  const [isShuffle, setIsShuffle] = React.useState(false)
  const [isReverse, setIsReverse] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = React.useState<string>("All")
  const [selectedTagId, setSelectedTagId] = React.useState<string>("All")

  // Tải thông tin bộ thẻ
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSet, resTags] = await Promise.all([
          fetch(`/api/sets/${setId}`),
          fetch("/api/tags"),
        ])

        if (resSet.ok) {
          const setData = await resSet.json()
          setSetDetail(setData)
        } else {
          toast.error("Không tìm thấy bộ thẻ.")
          router.push("/library")
        }

        if (resTags.ok) {
          const tagsData = await resTags.json()
          setTags(tagsData)
        }
      } catch (err) {
        console.error("Lỗi tải thông tin bộ thẻ:", err)
        toast.error("Lỗi kết nối máy chủ.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [setId, router])

  if (loading || !setDetail) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang tải chế độ học tập...
        </p>
      </div>
    )
  }

  // 6 Chế độ học tập
  const studyModes = [
    {
      id: "flashcard",
      title: "Flashcard (Lật thẻ 3D)",
      desc: "Lật thẻ trực quan, ghi nhớ nhanh từ vựng & furigana với hiệu ứng 3D và phát âm tự động.",
      icon: Layers,
      href: `/study/${setId}/flashcard`,
      color: "from-blue-600 to-indigo-600",
      badge: "Phổ biến nhất",
      accent: "text-blue-500",
      bgHover: "hover:border-blue-500/50",
    },
    {
      id: "learn",
      title: "Learn (Học thích ứng)",
      desc: "Thuật toán học thông minh kết hợp Trắc nghiệm, Đúng/Sai và Điền từ thích ứng theo năng lực.",
      icon: BrainCircuit,
      href: `/study/${setId}/learn`,
      color: "from-emerald-600 to-teal-600",
      badge: "Hiệu quả cao",
      accent: "text-emerald-500",
      bgHover: "hover:border-emerald-500/50",
    },
    {
      id: "write",
      title: "Write (Luyện viết)",
      desc: "Rèn luyện trí nhớ qua việc gõ từ vựng tiếng Nhật, hỗ trợ kiểm tra lỗi chính tả và gợi ý chữ.",
      icon: Pencil,
      href: `/study/${setId}/write`,
      color: "from-amber-500 to-orange-600",
      badge: "Ghi nhớ sâu",
      accent: "text-amber-500",
      bgHover: "hover:border-amber-500/50",
    },
    {
      id: "test",
      title: "Test (Kiểm tra)",
      desc: "Bài thi tổng hợp với đồng hồ đếm ngược, tùy chỉnh số lượng câu hỏi và chấm điểm chi tiết.",
      icon: CheckSquare,
      href: `/study/${setId}/test`,
      color: "from-purple-600 to-pink-600",
      badge: "Đánh giá",
      accent: "text-purple-500",
      bgHover: "hover:border-purple-500/50",
    },
    {
      id: "match",
      title: "Match (Ghép đôi)",
      desc: "Trò chơi nối từ vựng tiếng Nhật với nghĩa tiếng Việt cực kỳ vui nhộn, cạnh tranh kỷ lục thời gian.",
      icon: Sparkles,
      href: `/study/${setId}/match`,
      color: "from-rose-500 to-red-600",
      badge: "Trò chơi",
      accent: "text-rose-500",
      bgHover: "hover:border-rose-500/50",
    },
    {
      id: "listen",
      title: "Listen (Luyện nghe)",
      desc: "Nghe phát âm tiếng Nhật bản xứ với nhiều tốc độ và gõ lại để nâng cao phản xạ âm thanh.",
      icon: Headphones,
      href: `/study/${setId}/listen`,
      color: "from-cyan-500 to-blue-600",
      badge: "Luyện nghe",
      accent: "text-cyan-500",
      bgHover: "hover:border-cyan-500/50",
    },
  ]

  const pct = setDetail.progress?.percentage || 0

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Navigation Back */}
      <div className="flex items-center justify-between">
        <Link
          href={`/sets/${setId}`}
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
      <div className="border-border from-card via-card to-muted/20 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
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

      {/* Tùy chọn học tập (Study Options Panel) */}
      <div className="border-border bg-card/60 rounded-3xl border p-5 shadow-2xs">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal className="text-primary size-4" />
          <h2 className="text-foreground text-sm font-bold">
            Tùy chọn ôn tập chung
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Đảo mặt thẻ */}
          <div className="border-border/60 bg-background/50 flex items-center justify-between rounded-2xl border p-3.5">
            <div className="space-y-0.5">
              <Label
                htmlFor="opt-reverse"
                className="text-foreground cursor-pointer text-xs font-bold"
              >
                Đảo mặt thẻ (Reverse)
              </Label>
              <p className="text-muted-foreground text-[10px]">
                Hỏi tiếng Việt → tiếng Nhật
              </p>
            </div>
            <Switch
              id="opt-reverse"
              checked={isReverse}
              onCheckedChange={setIsReverse}
            />
          </div>

          {/* 2. Xáo trộn thứ tự */}
          <div className="border-border/60 bg-background/50 flex items-center justify-between rounded-2xl border p-3.5">
            <div className="space-y-0.5">
              <Label
                htmlFor="opt-shuffle"
                className="text-foreground cursor-pointer text-xs font-bold"
              >
                Xáo trộn thứ tự
              </Label>
              <p className="text-muted-foreground text-[10px]">
                Đổi vị trí ngẫu nhiên
              </p>
            </div>
            <Switch
              id="opt-shuffle"
              checked={isShuffle}
              onCheckedChange={setIsShuffle}
            />
          </div>

          {/* 3. Lọc theo SRS status */}
          <div className="border-border/60 bg-background/50 space-y-1.5 rounded-2xl border p-3.5">
            <Label className="text-foreground text-xs font-bold">
              Trạng thái SRS
            </Label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border-input bg-background text-foreground h-8 w-full rounded-xl border px-2.5 text-xs font-medium"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="New">Thẻ mới (New)</option>
              <option value="Learning">Đang học (Learning)</option>
              <option value="Review">Cần ôn (Review)</option>
              <option value="Mastered">Đã thuộc (Mastered)</option>
            </select>
          </div>

          {/* 4. Lọc theo nhãn (Tags) */}
          <div className="border-border/60 bg-background/50 space-y-1.5 rounded-2xl border p-3.5">
            <Label className="text-foreground text-xs font-bold">
              Lọc theo nhãn (Tag)
            </Label>
            <select
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
              className="border-input bg-background text-foreground h-8 w-full rounded-xl border px-2.5 text-xs font-medium"
            >
              <option value="All">Tất cả các nhãn</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  🏷️ {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 6 Study Modes Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
          <Zap className="text-primary size-4 fill-current" />
          <span>Chọn 1 trong 6 chế độ học tập</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studyModes.map((mode) => (
            <Link
              key={mode.id}
              href={mode.href}
              className={cn(
                "group border-border bg-card relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
                mode.bgHover
              )}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={cn(
                      "flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-105",
                      mode.color
                    )}
                  >
                    <mode.icon className="size-7" />
                  </div>

                  <Badge
                    variant="secondary"
                    className="text-[10px] font-semibold"
                  >
                    {mode.badge}
                  </Badge>
                </div>

                <h3 className="text-foreground group-hover:text-primary text-lg font-bold transition-colors">
                  {mode.title}
                </h3>
                <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                  {mode.desc}
                </p>
              </div>

              <div className="border-border/60 mt-6 flex items-center justify-between border-t pt-4">
                <span className="text-muted-foreground group-hover:text-foreground text-xs font-semibold transition-colors">
                  Bắt đầu học
                </span>
                <div className="bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground flex size-8 items-center justify-center rounded-xl transition-colors">
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
