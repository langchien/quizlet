"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Play,
  Volume2,
  Edit2,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  Search,
  CheckSquare,
  Square,
  Tag as TagIcon,
  BrainCircuit,
  Pencil,
  Headphones,
  ArrowLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CreateCardModal } from "@/components/modals/create-card-modal"
import { CreateSetModal } from "@/components/modals/create-set-modal"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  deleteCardAction,
  duplicateCardAction,
  bulkTagCardsAction,
} from "@/actions/cards"

export interface CardItem {
  id: string
  studySetId: string
  term: string
  reading: string
  definition: string
  example?: string | null
  exampleTranslation?: string | null
  imageUrl?: string | null
  audioUrl?: string | null
  note?: string | null
  jlptLevel?: string | null
  wordType?: string | null
  radicals?: string | null
  strokeCount?: number | null
  onReading?: string | null
  kunReading?: string | null
  compounds?: string | null
  order: number
  tags: Array<{ id: string; name: string; color: string }>
  srsData?: {
    status: "New" | "Learning" | "Review" | "Mastered"
    interval: number
    repetitions: number
  } | null
}

export interface SetDetailData {
  id: string
  name: string
  description?: string | null
  sourceLanguage: string
  targetLanguage: string
  folderId?: string | null
  userId: string
  cardCount: number
  folder?: { id: string; name: string } | null
  cards: CardItem[]
  progress?: {
    mastered: number
    learning: number
    new: number
    percentage: number
  }
}

interface SetDetailClientProps {
  initialSet: SetDetailData
  availableTags: Array<{ id: string; name: string; color: string }>
}

export function SetDetailClient({
  initialSet,
  availableTags,
}: SetDetailClientProps) {
  const router = useRouter()
  const setId = initialSet.id

  const [searchCard, setSearchCard] = React.useState("")
  const [selectedCardIds, setSelectedCardIds] = React.useState<Set<string>>(
    new Set()
  )

  // Modals
  const [cardModalOpen, setCardModalOpen] = React.useState(false)
  const [editingCard, setEditingCard] = React.useState<CardItem | null>(null)
  const [editSetModalOpen, setEditSetModalOpen] = React.useState(false)
  const [cardToDelete, setCardToDelete] = React.useState<CardItem | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  // Bulk tag state
  const [bulkTagModalOpen, setBulkTagModalOpen] = React.useState(false)
  const [selectedTagIdForBulk, setSelectedTagIdForBulk] = React.useState("")
  const [, startTransition] = React.useTransition()

  // Text to speech helper
  const speakJapanese = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ja-JP"
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    } else {
      toast.error("Trình duyệt không hỗ trợ phát âm tự động")
    }
  }

  // Checkbox handlers
  const toggleSelectAll = () => {
    if (selectedCardIds.size === initialSet.cards.length) {
      setSelectedCardIds(new Set())
    } else {
      setSelectedCardIds(new Set(initialSet.cards.map((c) => c.id)))
    }
  }

  const toggleSelectCard = (id: string) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Actions on Card qua Server Actions
  const confirmDeleteCard = () => {
    if (!cardToDelete) return
    startTransition(async () => {
      try {
        const res = await deleteCardAction(cardToDelete.id)
        if (res.success) {
          toast.success("Đã xoá thẻ thành công")
          router.refresh()
        } else {
          toast.error(res.error || "Xoá thẻ thất bại")
        }
      } catch {
        toast.error("Lỗi khi xoá thẻ")
      } finally {
        setCardToDelete(null)
      }
    })
  }

  const handleDuplicateCard = (id: string) => {
    startTransition(async () => {
      try {
        const res = await duplicateCardAction(id)
        if (res.success) {
          toast.success("Đã nhân bản thẻ thành công")
          router.refresh()
        } else {
          toast.error(res.error || "Nhân bản thẻ thất bại")
        }
      } catch {
        toast.error("Lỗi khi nhân bản thẻ")
      }
    })
  }

  // Bulk Actions
  const confirmBulkDelete = () => {
    const ids = Array.from(selectedCardIds)
    startTransition(async () => {
      try {
        await Promise.all(ids.map((id) => deleteCardAction(id)))
        toast.success(`Đã xoá ${ids.length} thẻ thành công`)
        setSelectedCardIds(new Set())
        router.refresh()
      } catch {
        toast.error("Lỗi khi xoá hàng loạt")
      } finally {
        setBulkDeleteOpen(false)
      }
    })
  }

  const handleBulkTag = () => {
    if (!selectedTagIdForBulk) {
      toast.error("Vui lòng chọn một nhãn")
      return
    }

    startTransition(async () => {
      try {
        const res = await bulkTagCardsAction({
          cardIds: Array.from(selectedCardIds),
          tagIds: [selectedTagIdForBulk],
          action: "add",
        })

        if (res.success) {
          toast.success("Đã gán nhãn cho các thẻ đã chọn")
          setBulkTagModalOpen(false)
          setSelectedTagIdForBulk("")
          router.refresh()
        } else {
          toast.error(res.error || "Gán nhãn thất bại")
        }
      } catch {
        toast.error("Lỗi khi gán nhãn")
      }
    })
  }

  const filteredCards = initialSet.cards.filter((card) => {
    if (!searchCard.trim()) return true
    const q = searchCard.toLowerCase()
    return (
      card.term.toLowerCase().includes(q) ||
      card.reading.toLowerCase().includes(q) ||
      card.definition.toLowerCase().includes(q) ||
      card.example?.toLowerCase().includes(q) ||
      card.tags.some((t) => t.name.toLowerCase().includes(q))
    )
  })

  const pct = initialSet.progress?.percentage || 0

  const studyModes = [
    {
      title: "Flashcard",
      desc: "Lật thẻ ôn tập 3D",
      icon: Layers,
      href: `/study/${setId}/flashcard`,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Learn (Học)",
      desc: "Trắc nghiệm & Thích ứng",
      icon: BrainCircuit,
      href: `/study/${setId}/learn`,
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Viết (Write)",
      desc: "Gõ từ vựng tiếng Nhật",
      icon: Pencil,
      href: `/study/${setId}/write`,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Kiểm tra (Test)",
      desc: "Bài test tính giờ",
      icon: CheckSquare,
      href: `/study/${setId}/test`,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Ghép đôi (Match)",
      desc: "Trò chơi ghép nhanh",
      icon: Sparkles,
      href: `/study/${setId}/match`,
      color: "from-rose-500 to-red-600",
    },
    {
      title: "Luyện nghe (Listen)",
      desc: "Nghe phát âm & gõ lại",
      icon: Headphones,
      href: `/study/${setId}/listen`,
      color: "from-cyan-500 to-blue-600",
    },
  ]

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb & Navigation Back */}
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <Link
          href="/library"
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Thư viện</span>
        </Link>
        {initialSet.folder && (
          <>
            <ChevronRight className="size-3" />
            <Link
              href={`/library?folderId=${initialSet.folder.id}`}
              className="hover:text-foreground transition-colors"
            >
              📁 {initialSet.folder.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3" />
        <span className="text-foreground max-w-xs truncate font-semibold">
          {initialSet.name}
        </span>
      </div>

      {/* Header Overview Card */}
      <div className="border-border from-card via-card to-muted/20 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary rounded-md px-2.5 py-1 text-xs font-semibold">
                {initialSet.cardCount} thẻ từ vựng
              </span>
              {initialSet.folder && (
                <span className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-500">
                  📁 {initialSet.folder.name}
                </span>
              )}
            </div>

            <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              {initialSet.name}
            </h1>

            {initialSet.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {initialSet.description}
              </p>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/study/${setId}`}>
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
              onClick={() => setEditSetModalOpen(true)}
              className="gap-1.5"
            >
              <Edit2 className="size-3.5" />
              <span>Sửa</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingCard(null)
                setCardModalOpen(true)
              }}
              className="gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Thêm thẻ</span>
            </Button>
          </div>
        </div>

        {/* Progress Stats Summary */}
        <div className="border-border/60 mt-6 grid grid-cols-2 gap-3 border-t pt-6 sm:grid-cols-4">
          <div className="border-border/60 bg-background/50 rounded-2xl border p-3">
            <div className="text-muted-foreground text-[11px] font-medium">
              Đã thành thục (Mastered)
            </div>
            <div className="mt-0.5 text-lg font-bold text-emerald-500">
              {initialSet.progress?.mastered || 0}{" "}
              <span className="text-muted-foreground text-xs font-normal">
                thẻ
              </span>
            </div>
          </div>

          <div className="border-border/60 bg-background/50 rounded-2xl border p-3">
            <div className="text-muted-foreground text-[11px] font-medium">
              Đang học (Learning)
            </div>
            <div className="mt-0.5 text-lg font-bold text-amber-500">
              {initialSet.progress?.learning || 0}{" "}
              <span className="text-muted-foreground text-xs font-normal">
                thẻ
              </span>
            </div>
          </div>

          <div className="border-border/60 bg-background/50 rounded-2xl border p-3">
            <div className="text-muted-foreground text-[11px] font-medium">
              Thẻ mới (New)
            </div>
            <div className="mt-0.5 text-lg font-bold text-blue-500">
              {initialSet.progress?.new || 0}{" "}
              <span className="text-muted-foreground text-xs font-normal">
                thẻ
              </span>
            </div>
          </div>

          <div className="border-border/60 bg-background/50 rounded-2xl border p-3">
            <div className="text-muted-foreground text-[11px] font-medium">
              Tỷ lệ ghi nhớ
            </div>
            <div className="text-foreground mt-0.5 text-lg font-bold">
              {pct}%
            </div>
          </div>
        </div>
      </div>

      {/* 6 Study Modes Launcher */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
            <Play className="text-primary size-4 fill-current" />
            <span>Chọn chế độ học tập</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {studyModes.map((mode) => (
            <Link
              key={mode.title}
              href={mode.href}
              className="group border-border bg-card hover:border-primary/50 relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center shadow-2xs transition-all hover:shadow-md"
            >
              <div
                className={cn(
                  "mb-2.5 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-xs transition-transform group-hover:scale-110",
                  mode.color
                )}
              >
                <mode.icon className="size-5" />
              </div>
              <span className="text-foreground group-hover:text-primary text-xs font-bold transition-colors">
                {mode.title}
              </span>
              <span className="text-muted-foreground mt-0.5 text-[10px]">
                {mode.desc}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Cards Table Management Section */}
      <div className="space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-foreground text-base font-bold">
              Danh sách thẻ ({initialSet.cards.length})
            </h2>
            {selectedCardIds.size > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
                Đã chọn {selectedCardIds.size} thẻ
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search inside set */}
            <div className="relative min-w-[200px]">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
              <Input
                placeholder="Tìm thẻ..."
                value={searchCard}
                onChange={(e) => setSearchCard(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>

            {/* Bulk Action Buttons */}
            {selectedCardIds.size > 0 && (
              <div className="animate-in fade-in-0 flex items-center gap-1.5 duration-150">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkTagModalOpen(true)}
                  className="h-8 gap-1 text-xs"
                >
                  <TagIcon className="size-3.5 text-purple-500" />
                  <span>Gán nhãn</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteOpen(true)}
                  className="h-8 gap-1 text-xs"
                >
                  <Trash2 className="size-3.5" />
                  <span>Xoá ({selectedCardIds.size})</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Cards Table */}
        <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-muted-foreground hover:text-foreground rounded p-1"
                  >
                    {initialSet.cards.length > 0 &&
                    selectedCardIds.size === initialSet.cards.length ? (
                      <CheckSquare className="text-primary size-4" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Thuật ngữ & Cách đọc</TableHead>
                <TableHead>Định nghĩa tiếng Việt</TableHead>
                <TableHead className="hidden md:table-cell">Ví dụ</TableHead>
                <TableHead className="hidden lg:table-cell">Nhãn</TableHead>
                <TableHead className="w-28 text-center">SRS</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCards.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-muted-foreground h-32 text-center text-xs"
                  >
                    Chưa có thẻ nào trong bộ thẻ này. Nhấn &quot;Thêm thẻ
                    mới&quot; để tạo thẻ đầu tiên.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCards.map((card, idx) => {
                  const isSelected = selectedCardIds.has(card.id)
                  const srsStatus = card.srsData?.status || "New"

                  return (
                    <TableRow
                      key={card.id}
                      className={cn(isSelected && "bg-primary/5")}
                    >
                      {/* Checkbox */}
                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectCard(card.id)}
                          className="text-muted-foreground hover:text-foreground rounded p-1"
                        >
                          {isSelected ? (
                            <CheckSquare className="text-primary size-4" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </button>
                      </TableCell>

                      {/* Number */}
                      <TableCell className="text-muted-foreground text-center font-mono text-xs">
                        {idx + 1}
                      </TableCell>

                      {/* Term & Reading */}
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => speakJapanese(card.term)}
                            className="text-muted-foreground hover:bg-primary/10 hover:text-primary mt-0.5 rounded-md p-1 transition-colors"
                            title="Phát âm tiếng Nhật"
                          >
                            <Volume2 className="size-3.5" />
                          </button>
                          <div>
                            <div className="text-foreground font-japanese flex items-center gap-1.5 text-sm font-bold">
                              <span>{card.term}</span>
                              {card.jlptLevel && (
                                <span className="bg-primary/10 py-0.2 text-primary rounded px-1.5 text-[9px] font-bold">
                                  {card.jlptLevel}
                                </span>
                              )}
                            </div>
                            <div className="text-muted-foreground font-japanese text-xs">
                              {card.reading}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Definition */}
                      <TableCell>
                        <div className="text-foreground text-xs font-medium">
                          {card.definition}
                        </div>
                        {card.wordType && (
                          <span className="text-muted-foreground text-[10px]">
                            {card.wordType}
                          </span>
                        )}
                      </TableCell>

                      {/* Example */}
                      <TableCell className="hidden md:table-cell">
                        {card.example ? (
                          <div className="max-w-xs space-y-0.5">
                            <div className="text-foreground/80 font-japanese truncate text-xs">
                              {card.example}
                            </div>
                            {card.exampleTranslation && (
                              <div className="text-muted-foreground truncate text-[11px]">
                                {card.exampleTranslation}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            --
                          </span>
                        )}
                      </TableCell>

                      {/* Tags */}
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex max-w-xs flex-wrap gap-1">
                          {card.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded border px-1.5 py-0.5 text-[10px] font-medium"
                              style={{
                                borderColor: `${tag.color}40`,
                                backgroundColor: `${tag.color}15`,
                                color: tag.color,
                              }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      {/* SRS Status */}
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            srsStatus === "Mastered"
                              ? "success"
                              : srsStatus === "Learning"
                                ? "warning"
                                : "outline"
                          }
                          className="text-[10px]"
                        >
                          {srsStatus}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCard(card)
                              setCardModalOpen(true)
                            }}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                            title="Chỉnh sửa thẻ"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateCard(card.id)}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                            title="Nhân bản thẻ"
                          >
                            <Copy className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCardToDelete(card)}
                            className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5 transition-colors"
                            title="Xoá thẻ"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      <CreateCardModal
        open={cardModalOpen}
        onOpenChange={setCardModalOpen}
        studySetId={setId}
        editCard={editingCard}
        onSuccess={() => router.refresh()}
      />

      <CreateSetModal
        open={editSetModalOpen}
        onOpenChange={setEditSetModalOpen}
        editSet={initialSet}
        onSuccess={() => router.refresh()}
      />

      {/* Bulk Tag Dialog */}
      {bulkTagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setBulkTagModalOpen(false)}
          />
          <div className="border-border bg-card animate-in zoom-in-95 relative z-50 w-full max-w-sm rounded-2xl border p-5 shadow-xl">
            <h3 className="text-foreground text-sm font-bold">
              Gán nhãn cho {selectedCardIds.size} thẻ đã chọn
            </h3>
            <p className="text-muted-foreground mt-1 mb-4 text-xs">
              Chọn nhãn phân loại bạn muốn gán cho tất cả các thẻ này.
            </p>

            <div className="mb-4 space-y-1.5">
              <select
                value={selectedTagIdForBulk}
                onChange={(e) => setSelectedTagIdForBulk(e.target.value)}
                className="border-input bg-background w-full rounded-xl border px-3 py-2 text-xs"
              >
                <option value="">-- Chọn nhãn --</option>
                {availableTags.map((t) => (
                  <option key={t.id} value={t.id}>
                    🏷️ {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkTagModalOpen(false)}
              >
                Huỷ
              </Button>
              <Button size="sm" onClick={handleBulkTag}>
                Gán nhãn ngay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Card Alert Dialog */}
      <AlertDialog
        open={!!cardToDelete}
        onOpenChange={(open) => !open && setCardToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá thẻ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá thẻ từ &ldquo;{cardToDelete?.term}
              &rdquo;? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCardToDelete(null)}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteCard}
            >
              Xoá thẻ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Bulk Cards Alert Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá hàng loạt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá {selectedCardIds.size} thẻ đã chọn? Thao
              tác này sẽ xoá vĩnh viễn và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkDeleteOpen(false)}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmBulkDelete}
            >
              Xoá {selectedCardIds.size} thẻ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
