"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Play,
  Volume2,
  Layers,
  Sparkles,
  BrainCircuit,
  Pencil,
  CheckCircle2,
  BookOpen,
} from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useTTS } from "@/hooks/useTTS"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MistakeCard {
  id: string
  studySetId: string
  term: string
  reading: string
  definition: string
  example?: string | null
  exampleTranslation?: string | null
  jlptLevel?: string | null
  wordType?: string | null
  studySet?: { id: string; name: string } | null
  tags: Array<{ id: string; name: string; color: string }>
  srsData: {
    id: string
    status: string
    easeFactor: number
    interval: number
    repetitions: number
    nextReviewDate: string
    lastReviewDate?: string | null
    correctCount: number
    incorrectCount: number
    accuracy: number
  }
}

export default function ReviewMistakesPage() {
  const router = useRouter()
  const { speak } = useTTS()

  const [items, setItems] = React.useState<MistakeCard[]>([])
  const [totalMistakes, setTotalMistakes] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  // Filters & Sorting
  const [selectedSetId, setSelectedSetId] = React.useState<string>("all")
  const [selectedJLPT, setSelectedJLPT] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<string>("incorrectCount")

  // Launch Review Dialog
  const [launchModalOpen, setLaunchModalOpen] = React.useState(false)
  const [chosenMode, setChosenMode] = React.useState<
    "Flashcard" | "Learn" | "Write"
  >("Flashcard")
  const [isStartingReview, setIsStartingReview] = React.useState(false)

  // Tải danh sách Error Pool
  const fetchMistakes = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedSetId !== "all") params.set("studySetId", selectedSetId)
      if (selectedJLPT !== "all") params.set("jlpt", selectedJLPT)
      if (sortBy) params.set("sortBy", sortBy)

      const res = await fetch(`/api/study/mistakes?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
        setTotalMistakes(data.totalMistakeCount || 0)
      } else {
        toast.error("Không thể tải danh sách lỗi sai.")
      }
    } catch (err) {
      console.error("Error loading mistakes:", err)
      toast.error("Lỗi kết nối máy chủ.")
    } finally {
      setLoading(false)
    }
  }, [selectedSetId, selectedJLPT, sortBy])

  React.useEffect(() => {
    fetchMistakes()
  }, [fetchMistakes])

  // Lấy danh sách unique StudySets từ items để làm bộ lọc
  const uniqueSets = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const item of items) {
      if (item.studySet) {
        map.set(item.studySet.id, item.studySet.name)
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [items])

  // Bắt đầu phiên ôn tập lỗi sai
  const handleStartReviewSession = async () => {
    setIsStartingReview(true)
    try {
      const res = await fetch("/api/study/review-mistakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studySetId: selectedSetId !== "all" ? selectedSetId : undefined,
          mode: chosenMode,
          shuffle: true,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.cards.length === 0) {
          toast.info("Không có thẻ nào để ôn tập.")
          return
        }

        const targetSetId =
          selectedSetId !== "all" ? selectedSetId : data.cards[0]?.studySetId
        if (targetSetId) {
          router.push(`/study/${targetSetId}/${chosenMode.toLowerCase()}`)
        } else {
          toast.success("Khởi tạo phiên ôn lỗi sai thành công")
        }
      } else {
        toast.error("Lỗi khi khởi tạo phiên ôn tập.")
      }
    } catch (err) {
      console.error("Error starting mistakes session:", err)
      toast.error("Lỗi kết nối máy chủ.")
    } finally {
      setIsStartingReview(false)
      setLaunchModalOpen(false)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="border-border from-card via-card relative overflow-hidden rounded-3xl border bg-gradient-to-br to-rose-500/5 p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                ⭐ Error Pool
              </span>
              <span className="text-muted-foreground text-xs font-medium">
                {items.length} thẻ cần củng cố
              </span>
            </div>

            <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
              Ôn tập lỗi sai (Mistakes Pool)
            </h1>

            <p className="text-muted-foreground text-sm leading-relaxed">
              Tổng hợp toàn bộ các từ vựng bạn đã từng trả lời sai trong các
              phiên học. Hệ thống tự động ưu tiên các từ có tần suất sai cao
              nhất để giúp bạn khắc phục lỗ hổng kiến thức.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            <Button
              size="lg"
              disabled={items.length === 0}
              onClick={() => setLaunchModalOpen(true)}
              className="gap-2 rounded-2xl bg-rose-600 font-bold text-white shadow-md hover:bg-rose-700"
            >
              <Play className="size-4 fill-current" />
              <span>Bắt đầu ôn {items.length} thẻ sai</span>
            </Button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="border-border/60 mt-6 grid grid-cols-2 gap-3 border-t pt-6 sm:grid-cols-3">
          <div className="border-border/60 bg-background/50 rounded-2xl border p-3.5">
            <div className="text-muted-foreground text-xs font-medium">
              Số thẻ cần ôn lại
            </div>
            <div className="mt-0.5 text-xl font-black text-rose-500">
              {items.length}{" "}
              <span className="text-muted-foreground text-xs font-normal">
                thẻ
              </span>
            </div>
          </div>

          <div className="border-border/60 bg-background/50 rounded-2xl border p-3.5">
            <div className="text-muted-foreground text-xs font-medium">
              Tổng số lần trả lời sai
            </div>
            <div className="text-foreground mt-0.5 text-xl font-black">
              {totalMistakes}{" "}
              <span className="text-muted-foreground text-xs font-normal">
                lần
              </span>
            </div>
          </div>

          <div className="border-border/60 bg-background/50 rounded-2xl border p-3.5">
            <div className="text-muted-foreground text-xs font-medium">
              Mục tiêu thành thục
            </div>
            <div className="mt-0.5 text-xl font-black text-emerald-500">
              3 lần{" "}
              <span className="text-muted-foreground text-xs font-normal">
                đúng liên tiếp
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Set */}
          <select
            value={selectedSetId}
            onChange={(e) => setSelectedSetId(e.target.value)}
            className="border-input bg-card text-foreground rounded-xl border px-3 py-1.5 text-xs font-medium"
          >
            <option value="all">Tất cả bộ thẻ</option>
            {uniqueSets.map((s) => (
              <option key={s.id} value={s.id}>
                📁 {s.name}
              </option>
            ))}
          </select>

          {/* Filter by JLPT */}
          <select
            value={selectedJLPT}
            onChange={(e) => setSelectedJLPT(e.target.value)}
            className="border-input bg-card text-foreground rounded-xl border px-3 py-1.5 text-xs font-medium"
          >
            <option value="all">Tất cả cấp độ JLPT</option>
            <option value="N5">N5</option>
            <option value="N4">N4</option>
            <option value="N3">N3</option>
            <option value="N2">N2</option>
            <option value="N1">N1</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-input bg-card text-foreground rounded-xl border px-3 py-1.5 text-xs font-medium"
          >
            <option value="incorrectCount">Sai nhiều nhất</option>
            <option value="leastAccurate">Tỷ lệ đúng thấp nhất</option>
            <option value="lastReviewDate">Mới ôn gần đây</option>
          </select>
        </div>

        <div className="text-muted-foreground text-xs font-medium">
          Hiển thị {items.length} thẻ
        </div>
      </div>

      {/* Mistakes Table */}
      <div className="border-border bg-card overflow-hidden rounded-3xl border shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Thuật ngữ & Cách đọc</TableHead>
              <TableHead>Định nghĩa</TableHead>
              <TableHead className="hidden md:table-cell">Bộ thẻ</TableHead>
              <TableHead className="w-28 text-center">Tần suất sai</TableHead>
              <TableHead className="w-28 text-center">Độ chính xác</TableHead>
              <TableHead className="w-24 text-right">Phát âm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center">
                    <Skeleton className="mx-auto size-4 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-44 rounded" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-24 rounded" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="mx-auto h-5 w-10 rounded-full" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="mx-auto h-2 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto size-7 rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground h-40 text-center text-xs"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CheckCircle2 className="size-8 text-emerald-500" />
                    <span className="text-foreground font-bold">
                      Tuyệt vời! Bạn không có thẻ nào trong Error Pool.
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      Hãy tiếp tục học tập và duy trì phong độ nhé!
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground text-center font-mono text-xs">
                    {idx + 1}
                  </TableCell>

                  {/* Term & Reading */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-japanese text-foreground flex items-center gap-1.5 text-sm font-bold">
                          <span>{item.term}</span>
                          {item.jlptLevel && (
                            <span className="bg-primary/10 py-0.2 text-primary rounded px-1.5 text-[9px] font-bold">
                              {item.jlptLevel}
                            </span>
                          )}
                        </div>
                        <div className="font-japanese text-muted-foreground text-xs">
                          {item.reading}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Definition */}
                  <TableCell>
                    <div className="text-foreground text-xs font-medium">
                      {item.definition}
                    </div>
                    {item.example && (
                      <div className="text-muted-foreground font-japanese truncate text-[10px]">
                        {item.example}
                      </div>
                    )}
                  </TableCell>

                  {/* Set Name */}
                  <TableCell className="hidden md:table-cell">
                    {item.studySet ? (
                      <Link
                        href={`/sets/${item.studySet.id}`}
                        className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs transition-colors"
                      >
                        <BookOpen className="size-3" />
                        <span className="max-w-[150px] truncate">
                          {item.studySet.name}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-xs">--</span>
                    )}
                  </TableCell>

                  {/* Incorrect Count */}
                  <TableCell className="text-center">
                    <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-extrabold text-rose-600 dark:text-rose-400">
                      {item.srsData.incorrectCount} lần
                    </span>
                  </TableCell>

                  {/* Accuracy */}
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        "font-mono text-xs font-bold",
                        item.srsData.accuracy >= 70
                          ? "text-emerald-500"
                          : item.srsData.accuracy >= 40
                            ? "text-amber-500"
                            : "text-rose-500"
                      )}
                    >
                      {item.srsData.accuracy}%
                    </span>
                  </TableCell>

                  {/* Audio */}
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => speak(item.term)}
                      className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg p-2 transition-colors"
                      title="Phát âm"
                    >
                      <Volume2 className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mode Selection Modal for Reviewing Mistakes */}
      <Dialog open={launchModalOpen} onOpenChange={setLaunchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Sparkles className="text-primary size-4" />
              <span>Chọn chế độ ôn tập lỗi sai</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Bạn đang chuẩn bị ôn tập {items.length} thẻ có tần suất sai cao.
              Hãy chọn chế độ học phù hợp.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-3 py-4">
            <button
              type="button"
              onClick={() => setChosenMode("Flashcard")}
              className={cn(
                "border-border hover:border-primary/50 flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all",
                chosenMode === "Flashcard"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                  : "bg-card text-foreground"
              )}
            >
              <Layers className="mb-2 size-6 text-blue-500" />
              <span className="text-xs font-bold">Flashcard</span>
              <span className="text-muted-foreground mt-0.5 text-[10px]">
                Lật thẻ 3D
              </span>
            </button>

            <button
              type="button"
              onClick={() => setChosenMode("Learn")}
              className={cn(
                "border-border hover:border-primary/50 flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all",
                chosenMode === "Learn"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                  : "bg-card text-foreground"
              )}
            >
              <BrainCircuit className="mb-2 size-6 text-emerald-500" />
              <span className="text-xs font-bold">Learn</span>
              <span className="text-muted-foreground mt-0.5 text-[10px]">
                Thích ứng
              </span>
            </button>

            <button
              type="button"
              onClick={() => setChosenMode("Write")}
              className={cn(
                "border-border hover:border-primary/50 flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all",
                chosenMode === "Write"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                  : "bg-card text-foreground"
              )}
            >
              <Pencil className="mb-2 size-6 text-amber-500" />
              <span className="text-xs font-bold">Write</span>
              <span className="text-muted-foreground mt-0.5 text-[10px]">
                Luyện viết
              </span>
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLaunchModalOpen(false)}
            >
              Huỷ
            </Button>
            <Button
              size="sm"
              disabled={isStartingReview}
              onClick={handleStartReviewSession}
              className="gap-1.5 font-bold"
            >
              <Play className="size-3.5 fill-current" />
              <span>Bắt đầu ôn ngay</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
