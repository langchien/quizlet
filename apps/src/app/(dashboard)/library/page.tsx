"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  LayoutGrid,
  List,
  Search,
  Plus,
  BookOpen,
  Folder,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  GitMerge,
  Play,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import { CreateSetModal } from "@/components/modals/create-set-modal"
import { MergeSetsModal } from "@/components/modals/merge-sets-modal"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface StudySetItem {
  id: string
  name: string
  description?: string | null
  sourceLanguage: string
  targetLanguage: string
  folderId?: string | null
  userId: string
  cardCount: number
  createdAt: string
  updatedAt: string
  lastStudiedAt?: string | null
  folder?: { id: string; name: string } | null
  progress?: {
    mastered: number
    learning: number
    new: number
    percentage: number
  }
}

function LibraryContent() {
  const searchParams = useSearchParams()
  const folderParam = searchParams.get("folderId")

  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [sets, setSets] = React.useState<StudySetItem[]>([])
  const [folders, setFolders] = React.useState<
    Array<{ id: string; name: string }>
  >([])
  const [loading, setLoading] = React.useState(true)

  // Filters
  const [search, setSearch] = React.useState("")
  const [selectedFolder, setSelectedFolder] = React.useState<string>(
    folderParam || "all"
  )
  const [sortBy, setSortBy] = React.useState("updatedAt")
  const [sortOrder, setSortOrder] = React.useState("desc")

  // Modals
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [editingSet, setEditingSet] = React.useState<StudySetItem | null>(null)
  const [mergeModalOpen, setMergeModalOpen] = React.useState(false)
  const [setToDelete, setSetToDelete] = React.useState<StudySetItem | null>(null)

  // Sync folderParam
  React.useEffect(() => {
    if (folderParam) {
      setSelectedFolder(folderParam)
    }
  }, [folderParam])

  // Fetch Folders
  React.useEffect(() => {
    fetch("/api/folders?flat=true")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setFolders(data))
      .catch((err) => console.error("Error loading folders:", err))
  }, [])

  // Fetch Sets
  const fetchSets = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set("search", search.trim())
      if (selectedFolder !== "all") params.set("folderId", selectedFolder)
      params.set("sortBy", sortBy)
      params.set("sortOrder", sortOrder)
      params.set("limit", "100")

      const res = await fetch(`/api/sets?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setSets(data.items || [])
      }
    } catch (err) {
      console.error("Error fetching sets:", err)
      toast.error("Không thể tải danh sách bộ thẻ")
    } finally {
      setLoading(false)
    }
  }, [search, selectedFolder, sortBy, sortOrder])

  React.useEffect(() => {
    fetchSets()
  }, [fetchSets])

  // Listen to global refresh event
  React.useEffect(() => {
    const handleRefresh = () => fetchSets()
    window.addEventListener("refresh-library", handleRefresh)
    return () => window.removeEventListener("refresh-library", handleRefresh)
  }, [fetchSets])

  // Actions
  const handleDuplicate = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/sets/${id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${name} (Bản sao)` }),
      })
      if (res.ok) {
        toast.success(`Đã nhân bản bộ thẻ "${name}"`)
        fetchSets()
      } else {
        const json = await res.json()
        toast.error(json.error || "Nhân bản thất bại")
      }
    } catch {
      toast.error("Lỗi khi nhân bản bộ thẻ")
    }
  }

  const confirmDelete = async () => {
    if (!setToDelete) return
    const { id, name } = setToDelete

    try {
      const res = await fetch(`/api/sets/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success(`Đã xoá bộ thẻ "${name}"`)
        fetchSets()
      } else {
        const json = await res.json()
        toast.error(json.error || "Xoá bộ thẻ thất bại")
      }
    } catch {
      toast.error("Lỗi khi xoá bộ thẻ")
    } finally {
      setSetToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <Layers className="text-primary size-6" />
            <span>Thư viện bộ thẻ</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Quản lý, tổ chức và ôn tập toàn bộ các bộ thẻ từ vựng và Kanji của
            bạn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMergeModalOpen(true)}
            className="gap-1.5"
          >
            <GitMerge className="size-3.5 text-purple-500" />
            <span>Gộp bộ thẻ</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingSet(null)
              setCreateModalOpen(true)
            }}
            className="shadow-primary/20 gap-1.5 shadow-xs"
          >
            <Plus className="size-4" />
            <span>Tạo bộ thẻ</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="border-border bg-card/60 flex flex-col gap-3 rounded-2xl border p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Tìm theo tên bộ thẻ, mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Folder */}
          <div className="min-w-[140px]">
            <Select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="h-9 text-xs"
            >
              <option value="all">Tất cả thư mục</option>
              <option value="none">Chưa vào thư mục</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Sort By */}
          <div className="min-w-[130px]">
            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-")
                setSortBy(sb)
                setSortOrder(so)
              }}
              className="h-9 text-xs"
            >
              <option value="updatedAt-desc">Mới cập nhật</option>
              <option value="createdAt-desc">Mới tạo nhất</option>
              <option value="name-asc">Tên (A → Z)</option>
              <option value="cardCount-desc">Nhiều thẻ nhất</option>
            </Select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="border-border bg-muted/40 flex items-center rounded-xl border p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-lg p-1.5 transition-colors",
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Xem dạng lưới"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-lg p-1.5 transition-colors",
                viewMode === "list"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Xem dạng danh sách"
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border-border bg-card/40 h-44 animate-pulse rounded-2xl border"
            />
          ))}
        </div>
      ) : sets.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <div className="bg-primary/10 text-primary mb-3 flex size-12 items-center justify-center rounded-2xl">
            <BookOpen className="size-6" />
          </div>
          <h3 className="text-foreground text-base font-semibold">
            Chưa tìm thấy bộ thẻ nào
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs">
            {search || selectedFolder !== "all"
              ? "Không có bộ thẻ nào khớp với bộ lọc tìm kiếm hiện tại."
              : "Bắt đầu tạo bộ thẻ đầu tiên để ôn luyện từ vựng tiếng Nhật hiệu quả!"}
          </p>
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 gap-1.5"
          >
            <Plus className="size-4" />
            <span>Tạo bộ thẻ ngay</span>
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => {
            const pct = set.progress?.percentage || 0
            return (
              <div
                key={set.id}
                className="group border-border bg-card hover:border-primary/40 relative flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-md"
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {set.folder && (
                        <span className="mb-2 inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">
                          <Folder className="size-3" />
                          <span>{set.folder.name}</span>
                        </span>
                      )}
                      <Link
                        href={`/sets/${set.id}`}
                        className="text-foreground group-hover:text-primary line-clamp-1 block text-base font-bold transition-colors"
                      >
                        {set.name}
                      </Link>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1">
                        <MoreVertical className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="right" className="w-44">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingSet(set)
                            setCreateModalOpen(true)
                          }}
                          className="gap-2"
                        >
                          <Edit2 className="size-3.5" />
                          <span>Chỉnh sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(set.id, set.name)}
                          className="gap-2"
                        >
                          <Copy className="size-3.5" />
                          <span>Nhân bản</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          destructive
                          onClick={() => setSetToDelete(set)}
                          className="gap-2"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Xoá bộ thẻ</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {set.description && (
                    <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs">
                      {set.description}
                    </p>
                  )}
                </div>

                {/* Bottom stats & progress */}
                <div className="border-border/50 mt-5 space-y-3 border-t pt-3">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="text-muted-foreground flex justify-between text-[11px]">
                      <span>Tiến độ ghi nhớ</span>
                      <span className="text-foreground font-semibold">
                        {pct}%
                      </span>
                    </div>
                    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-foreground text-xs font-semibold">
                      {set.cardCount} thẻ
                    </span>

                    <Link
                      href={`/sets/${set.id}`}
                      className="bg-primary/10 hover:bg-primary/20 text-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                    >
                      <Play className="size-3 fill-current" />
                      <span>Học ngay</span>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="border-border bg-card divide-border/60 divide-y overflow-hidden rounded-2xl border">
          {sets.map((set) => {
            const pct = set.progress?.percentage || 0
            return (
              <div
                key={set.id}
                className="hover:bg-muted/30 group flex flex-col justify-between gap-3 p-4 transition-colors sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/sets/${set.id}`}
                      className="text-foreground group-hover:text-primary text-sm font-bold transition-colors"
                    >
                      {set.name}
                    </Link>
                    {set.folder && (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-500">
                        📁 {set.folder.name}
                      </span>
                    )}
                  </div>
                  {set.description && (
                    <p className="text-muted-foreground mt-0.5 max-w-xl truncate text-xs">
                      {set.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <div className="text-right">
                    <div className="text-foreground text-xs font-semibold">
                      {set.cardCount} thẻ
                    </div>
                    <div className="text-[10px] font-medium text-emerald-500">
                      Đã thuộc: {pct}%
                    </div>
                  </div>

                  <Link
                    href={`/sets/${set.id}`}
                    className="bg-primary/10 hover:bg-primary/20 text-primary inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
                  >
                    <Play className="size-3 fill-current" />
                    <span>Học</span>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1">
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="right" className="w-44">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingSet(set)
                          setCreateModalOpen(true)
                        }}
                        className="gap-2"
                      >
                        <Edit2 className="size-3.5" />
                        <span>Chỉnh sửa</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(set.id, set.name)}
                        className="gap-2"
                      >
                        <Copy className="size-3.5" />
                        <span>Nhân bản</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        destructive
                        onClick={() => setSetToDelete(set)}
                        className="gap-2"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Xoá</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <CreateSetModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        editSet={editingSet}
        onSuccess={() => fetchSets()}
      />

      <MergeSetsModal
        open={mergeModalOpen}
        onOpenChange={setMergeModalOpen}
        onSuccess={() => fetchSets()}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!setToDelete}
        onOpenChange={(open) => !open && setSetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá bộ thẻ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá bộ thẻ &ldquo;{setToDelete?.name}&rdquo;? Thao tác này sẽ xoá vĩnh viễn toàn bộ các thẻ bên trong và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSetToDelete(null)}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Xoá bộ thẻ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function LibraryPage() {
  return (
    <React.Suspense
      fallback={
        <div className="animate-pulse space-y-4 p-4">
          <div className="bg-card h-8 w-48 rounded-xl" />
          <div className="bg-card h-12 rounded-2xl" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card h-44 rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <LibraryContent />
    </React.Suspense>
  )
}
