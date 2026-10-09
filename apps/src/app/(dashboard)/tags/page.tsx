"use client"

import * as React from "react"
import Link from "next/link"
import {
  Tag as TagIcon,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { CreateTagModal } from "@/components/modals/create-tag-modal"
import { toast } from "sonner"

interface TagItem {
  id: string
  name: string
  color: string
  cardCount: number
  createdAt: string
  updatedAt: string
}

export default function TagsPage() {
  const [tags, setTags] = React.useState<TagItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [editingTag, setEditingTag] = React.useState<TagItem | null>(null)
  const [tagToDelete, setTagToDelete] = React.useState<TagItem | null>(null)

  const fetchTags = React.useCallback(async () => {
    try {
      const res = await fetch("/api/tags")
      if (res.ok) {
        const data = await res.json()
        setTags(data)
      }
    } catch (err) {
      console.error("Error loading tags:", err)
      toast.error("Không thể tải danh sách nhãn")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchTags()
  }, [fetchTags])

  // Listen to refresh tags event
  React.useEffect(() => {
    const handleRefresh = () => fetchTags()
    window.addEventListener("refresh-tags", handleRefresh)
    return () => window.removeEventListener("refresh-tags", handleRefresh)
  }, [fetchTags])

  const confirmDelete = async () => {
    if (!tagToDelete) return
    const { id, name } = tagToDelete

    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success(`Đã xoá nhãn "${name}"`)
        fetchTags()
      } else {
        toast.error("Xoá nhãn thất bại")
      }
    } catch {
      toast.error("Lỗi khi xoá nhãn")
    } finally {
      setTagToDelete(null)
    }
  }

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase().trim())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <TagIcon className="size-6 text-purple-500" />
            <span>Quản lý nhãn phân loại</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Gắn nhãn và phân nhóm các thẻ từ vựng xuyên suốt tất cả bộ thẻ.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingTag(null)
            setCreateModalOpen(true)
          }}
          className="shadow-primary/20 gap-1.5 shadow-xs"
        >
          <Plus className="size-4" />
          <span>Tạo nhãn mới</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="border-border bg-card/60 flex items-center rounded-2xl border p-3 shadow-2xs">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Tìm theo tên nhãn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* Tags Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="border-border bg-card/40 h-28 animate-pulse rounded-2xl border"
            />
          ))}
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
            <TagIcon className="size-6" />
          </div>
          <h3 className="text-foreground text-base font-semibold">
            {search ? "Không tìm thấy nhãn phù hợp" : "Chưa có nhãn nào"}
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs">
            Tạo nhãn mới để phân loại từ vựng theo chủ đề như Động từ, Kanji,
            Hay nhầm...
          </p>
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 gap-1.5"
          >
            <Plus className="size-4" />
            <span>Tạo nhãn ngay</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="group border-border bg-card hover:border-primary/40 relative flex flex-col justify-between rounded-2xl border p-4 shadow-2xs transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/tags/${tag.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2.5 group-hover:opacity-90"
                >
                  <span
                    className="size-4 shrink-0 rounded-full shadow-2xs"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-foreground truncate text-sm font-bold">
                    {tag.name}
                  </span>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1">
                    <MoreVertical className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="right" className="w-40">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingTag(tag)
                        setCreateModalOpen(true)
                      }}
                      className="gap-2"
                    >
                      <Edit2 className="size-3.5" />
                      <span>Chỉnh sửa</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      destructive
                      onClick={() => setTagToDelete(tag)}
                      className="gap-2"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Xoá nhãn</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="border-border/50 mt-4 flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground">
                  {tag.cardCount} thẻ đang gắn
                </span>
                <Link
                  href={`/tags/${tag.id}`}
                  className="text-primary text-[11px] font-semibold hover:underline"
                >
                  Xem các thẻ →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateTagModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        editTag={editingTag}
        onSuccess={() => fetchTags()}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!tagToDelete}
        onOpenChange={(open) => !open && setTagToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá nhãn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xoá nhãn &ldquo;{tagToDelete?.name}&rdquo;? Nhãn sẽ được gỡ khỏi các thẻ nhưng nội dung thẻ vẫn được giữ nguyên.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTagToDelete(null)}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Xoá nhãn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
