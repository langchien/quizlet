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
import { deleteTagAction, getTagsAction } from "@/actions/tags"
import type { TagWithCount } from "@/lib/dal/tags"

interface TagsClientProps {
  initialTags: TagWithCount[]
}

export function TagsClient({ initialTags }: TagsClientProps) {
  const [tags, setTags] = React.useState<TagWithCount[]>(initialTags)
  const [search, setSearch] = React.useState("")
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [editingTag, setEditingTag] = React.useState<TagWithCount | null>(null)
  const [tagToDelete, setTagToDelete] = React.useState<TagWithCount | null>(
    null
  )
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Cập nhật khi initialTags từ server thay đổi
  React.useEffect(() => {
    setTags(initialTags)
  }, [initialTags])

  const refreshTags = React.useCallback(async () => {
    const res = await getTagsAction()
    if (res.success && res.data) {
      setTags(res.data)
    }
  }, [])

  // Lắng nghe sự kiện refresh
  React.useEffect(() => {
    const handleRefresh = () => refreshTags()
    window.addEventListener("refresh-tags", handleRefresh)
    return () => window.removeEventListener("refresh-tags", handleRefresh)
  }, [refreshTags])

  const confirmDelete = async () => {
    if (!tagToDelete) return
    const { id, name } = tagToDelete

    setIsDeleting(true)
    try {
      const res = await deleteTagAction(id)
      if (res.success) {
        toast.success(`Đã xoá nhãn "${name}"`)
        setTags((prev) => prev.filter((t) => t.id !== id))
      } else {
        toast.error(res.error || "Xoá nhãn thất bại")
      }
    } catch {
      toast.error("Lỗi khi xoá nhãn")
    } finally {
      setIsDeleting(false)
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
      {filteredTags.length === 0 ? (
        <div className="border-border bg-card/40 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
            <TagIcon className="size-6" />
          </div>
          <h3 className="text-foreground mt-4 text-base font-semibold">
            {search ? "Không tìm thấy nhãn phù hợp" : "Chưa có nhãn nào"}
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs">
            {search
              ? `Không có nhãn nào chứa từ khóa "${search}". Thử từ khóa khác.`
              : "Tạo các nhãn phân loại (như N5, N4, Kanji, Ngữ pháp) để dễ dàng gom nhóm và ôn tập thẻ học."}
          </p>
          {!search && (
            <Button
              size="sm"
              onClick={() => {
                setEditingTag(null)
                setCreateModalOpen(true)
              }}
              className="mt-5 gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              <span>Tạo nhãn đầu tiên</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="group border-border bg-card hover:border-border/80 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-2xs transition-all hover:shadow-md"
            >
              {/* Top Row: Color indicator, name & actions */}
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/tags/${tag.id}`}
                  className="flex flex-1 items-center gap-2.5 overflow-hidden"
                >
                  <div
                    className="size-3.5 shrink-0 rounded-full ring-2 ring-white/20 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: tag.color || "#3B82F6" }}
                  />
                  <span className="text-foreground truncate text-sm font-semibold transition-colors group-hover:text-purple-500">
                    {tag.name}
                  </span>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground hover:bg-muted/60 flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors">
                    <MoreVertical className="size-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingTag(tag)
                        setCreateModalOpen(true)
                      }}
                      className="cursor-pointer gap-2 text-xs"
                    >
                      <Edit2 className="size-3.5" />
                      <span>Chỉnh sửa</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setTagToDelete(tag)}
                      className="cursor-pointer gap-2 text-xs text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/20"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Xoá nhãn</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Bottom Row: Stats & View Link */}
              <div className="border-border/40 mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-muted-foreground text-xs font-medium">
                  {tag.cardCount} thẻ liên kết
                </span>

                <Link
                  href={`/tags/${tag.id}`}
                  className="text-xs font-medium text-purple-500 transition-colors hover:text-purple-600 hover:underline"
                >
                  Xem thẻ &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tạo/Sửa Tag */}
      <CreateTagModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        editTag={editingTag}
        onSuccess={() => {
          refreshTags()
        }}
      />

      {/* Modal Xác nhận xoá */}
      <AlertDialog
        open={Boolean(tagToDelete)}
        onOpenChange={(open) => !open && setTagToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá nhãn?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá nhãn &quot;{tagToDelete?.name}&quot;?
              Việc này sẽ gỡ bỏ nhãn khỏi tất cả {tagToDelete?.cardCount} thẻ
              liên quan, nhưng{" "}
              <strong className="text-foreground">không xoá các thẻ</strong> của
              bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? "Đang xoá..." : "Xoá nhãn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
