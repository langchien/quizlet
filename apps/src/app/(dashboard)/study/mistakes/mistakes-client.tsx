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
  Loader2,
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
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  getMistakeCardsAction,
  startReviewMistakesAction,
} from "@/actions/study"
import type { JLPTLevel } from "@/generated/prisma/client"

export interface MistakeCard {
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
    correctCount: number
    incorrectCount: number
    lastReviewDate?: Date | string | null
  }
  stats?: {
    totalAttempts: number
    accuracy: number
    incorrectCount: number
  }
}

interface MistakesClientProps {
  initialItems: MistakeCard[]
}

export function MistakesClient({ initialItems }: MistakesClientProps) {
  const router = useRouter()
  const { speak } = useTTS()

  const [items, setItems] = React.useState<MistakeCard[]>(initialItems)
  const [isFilterPending, startFilterTransition] = React.useTransition()

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

  // Lọc danh sách Error Pool
  const handleFilterChange = (
    newSetId = selectedSetId,
    newJLPT = selectedJLPT,
    newSortBy = sortBy
  ) => {
    setSelectedSetId(newSetId)
    setSelectedJLPT(newJLPT)
    setSortBy(newSortBy)

    startFilterTransition(async () => {
      const res = await getMistakeCardsAction({
        studySetId: newSetId !== "all" ? newSetId : undefined,
        jlpt: newJLPT !== "all" ? (newJLPT as JLPTLevel) : undefined,
        sortBy: newSortBy,
      })

      if (res.success && res.data) {
        setItems(res.data as unknown as MistakeCard[])
      } else {
        toast.error(res.error || "Không thể tải danh sách lỗi sai.")
      }
    })
  }

  // Lấy danh sách unique StudySets từ initialItems để làm bộ lọc
  const uniqueSets = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const item of initialItems) {
      if (item.studySet) {
        map.set(item.studySet.id, item.studySet.name)
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [initialItems])

  // Bắt đầu phiên ôn tập lỗi sai
  const handleStartReviewSession = async () => {
    setIsStartingReview(true)
    try {
      const res = await startReviewMistakesAction({
        studySetId: selectedSetId !== "all" ? selectedSetId : undefined,
        mode: chosenMode,
        shuffle: true,
      })

      if (res.success && res.data) {
        if (res.data.cards.length === 0) {
          toast.info("Không có thẻ nào để ôn tập.")
          return
        }

        const targetSetId =
          selectedSetId !== "all"
            ? selectedSetId
            : res.data.cards[0]?.studySetId
        if (targetSetId) {
          router.push(`/study/${targetSetId}/${chosenMode.toLowerCase()}`)
        } else {
          toast.success("Khởi tạo phiên ôn lỗi sai thành công")
        }
      } else {
        toast.error(res.error || "Lỗi khi khởi tạo phiên ôn tập.")
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
              {isFilterPending && (
                <Loader2 className="text-primary size-3.5 animate-spin" />
              )}
            </div>

            <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
              Ôn tập lỗi sai (Mistakes Pool)
            </h1>
            <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
              Kho lưu trữ những thẻ từ vựng bạn đã từng trả lời sai trong tất cả
              các chế độ học. Tập trung ôn luyện những điểm yếu này để nhanh
              chóng tăng độ chính xác!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setLaunchModalOpen(true)}
              disabled={items.length === 0}
              className="gap-2 rounded-2xl bg-rose-600 px-6 py-5 text-sm font-bold text-white shadow-md hover:bg-rose-700"
            >
              <Play className="size-4 fill-current" />
              <span>Ôn tập ngay ({items.length})</span>
            </Button>
          </div>
        </div>

        {/* Bộ lọc & Sắp xếp */}
        <div className="border-border/60 bg-muted/40 mt-8 grid grid-cols-1 gap-3 rounded-2xl border p-3 sm:grid-cols-3">
          {/* Lọc theo Bộ thẻ */}
          <div>
            <label className="text-muted-foreground mb-1 block text-[11px] font-bold">
              Bộ thẻ:
            </label>
            <select
              value={selectedSetId}
              onChange={(e) =>
                handleFilterChange(e.target.value, selectedJLPT, sortBy)
              }
              disabled={isFilterPending}
              className="border-input bg-card text-foreground h-9 w-full rounded-xl border px-3 text-xs font-medium focus:outline-none"
            >
              <option value="all">Tất cả bộ thẻ</option>
              {uniqueSets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo JLPT */}
          <div>
            <label className="text-muted-foreground mb-1 block text-[11px] font-bold">
              Cấp độ JLPT:
            </label>
            <select
              value={selectedJLPT}
              onChange={(e) =>
                handleFilterChange(selectedSetId, e.target.value, sortBy)
              }
              disabled={isFilterPending}
              className="border-input bg-card text-foreground h-9 w-full rounded-xl border px-3 text-xs font-medium focus:outline-none"
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="N5">N5</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
              <option value="N2">N2</option>
              <option value="N1">N1</option>
            </select>
          </div>

          {/* Sắp xếp */}
          <div>
            <label className="text-muted-foreground mb-1 block text-[11px] font-bold">
              Sắp xếp theo:
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                handleFilterChange(selectedSetId, selectedJLPT, e.target.value)
              }
              disabled={isFilterPending}
              className="border-input bg-card text-foreground h-9 w-full rounded-xl border px-3 text-xs font-medium focus:outline-none"
            >
              <option value="incorrectCount">Số lần sai nhiều nhất</option>
              <option value="leastAccurate">Độ chính xác thấp nhất</option>
              <option value="lastReviewDate">Mới ôn gần đây</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bảng Danh sách lỗi sai */}
      <div
        className={`border-border bg-card overflow-hidden rounded-3xl border shadow-2xs transition-opacity ${isFilterPending ? "opacity-50" : ""}`}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center text-xs font-bold">
                #
              </TableHead>
              <TableHead className="text-xs font-bold">Từ vựng</TableHead>
              <TableHead className="text-xs font-bold">Ý nghĩa</TableHead>
              <TableHead className="text-xs font-bold">Bộ thẻ</TableHead>
              <TableHead className="text-center text-xs font-bold">
                Số lần sai
              </TableHead>
              <TableHead className="text-center text-xs font-bold">
                Độ chính xác
              </TableHead>
              <TableHead className="text-right text-xs font-bold">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item, idx) => {
                const totalAttempts =
                  item.stats?.totalAttempts ??
                  item.srsData.correctCount + item.srsData.incorrectCount
                const accuracy =
                  item.stats?.accuracy ??
                  (totalAttempts > 0
                    ? Math.round(
                        (item.srsData.correctCount / totalAttempts) * 100
                      )
                    : 0)

                return (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground text-center text-xs font-medium">
                      {idx + 1}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-foreground text-sm font-bold">
                            {item.term}
                          </div>
                          {item.reading && (
                            <div className="text-muted-foreground text-xs font-medium">
                              {item.reading}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => speak(item.term)}
                          className="size-7 rounded-lg"
                        >
                          <Volume2 className="size-3.5 text-blue-500" />
                        </Button>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-foreground text-xs font-medium">
                        {item.definition}
                      </span>
                    </TableCell>

                    <TableCell>
                      {item.studySet ? (
                        <Link
                          href={`/sets/${item.studySet.id}`}
                          className="hover:text-primary text-muted-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors"
                        >
                          <BookOpen className="size-3" />
                          <span>{item.studySet.name}</span>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Tự do
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-black text-rose-600 dark:text-rose-400">
                        {item.srsData.incorrectCount} lần
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="bg-muted h-1.5 w-12 overflow-hidden rounded-full">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              accuracy >= 70
                                ? "bg-emerald-500"
                                : accuracy >= 40
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                            )}
                            style={{ width: `${accuracy}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold">
                          {accuracy}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speak(item.term)}
                        className="h-8 gap-1 rounded-xl text-xs"
                      >
                        <Volume2 className="size-3.5" />
                        <span>Nghe</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-12 text-center text-xs"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CheckCircle2 className="size-8 text-emerald-500" />
                    <p className="text-foreground text-sm font-bold">
                      Tuyệt vời! Không có lỗi sai nào.
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Bạn đã hoàn thành tốt các bài học hoặc chưa có dữ liệu sai
                      trong bộ lọc này.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Chọn Chế Độ Ôn Lại Lỗi Sai */}
      <Dialog open={launchModalOpen} onOpenChange={setLaunchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base font-bold">
              <Sparkles className="size-5 text-rose-500" />
              <span>Chọn chế độ ôn tập lỗi sai</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Hệ thống sẽ lấy {items.length} thẻ từ vựng trong danh sách lỗi sai
              này để tạo một phiên học tập trung.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 py-3">
            {[
              {
                mode: "Flashcard" as const,
                title: "Flashcard 3D",
                desc: "Lật thẻ và tự đánh giá mức độ ghi nhớ từ vựng.",
                icon: Layers,
                color: "text-blue-500 bg-blue-500/10",
              },
              {
                mode: "Learn" as const,
                title: "Học thích ứng (Learn)",
                desc: "Trắc nghiệm thông minh kết hợp tự điền từ.",
                icon: BrainCircuit,
                color: "text-emerald-500 bg-emerald-500/10",
              },
              {
                mode: "Write" as const,
                title: "Luyện viết (Write)",
                desc: "Gõ lại chính xác từ vựng tiếng Nhật để khắc phục lỗi.",
                icon: Pencil,
                color: "text-amber-500 bg-amber-500/10",
              },
            ].map((m) => (
              <button
                key={m.mode}
                type="button"
                onClick={() => setChosenMode(m.mode)}
                className={cn(
                  "border-border flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all",
                  chosenMode === m.mode
                    ? "border-primary bg-primary/5 ring-primary/20 ring-2"
                    : "hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    m.color
                  )}
                >
                  <m.icon className="size-5" />
                </div>
                <div>
                  <div className="text-foreground text-xs font-bold">
                    {m.title}
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    {m.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLaunchModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleStartReviewSession}
              disabled={isStartingReview}
              className="gap-1.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
            >
              {isStartingReview ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Đang khởi tạo...</span>
                </>
              ) : (
                <>
                  <Play className="size-3.5 fill-current" />
                  <span>Bắt đầu ôn tập</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
