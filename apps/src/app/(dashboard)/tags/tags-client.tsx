"use client"

import * as React from "react"
import { CreateTagModal } from "@/components/modals/create-tag-modal"
import { deleteTagAction, getTagsAction } from "@/actions/tags"
import type { TagWithCount } from "@/lib/dal/tags"
import {
  TagsHeader,
  TagsSearchBar,
  TagCard,
  TagEmptyState,
} from "@/components/tags"
import { ConfirmDeleteDialog } from "@/components/common"
import { useDeleteConfirm, useDebounceSearch } from "@/hooks/common"

interface TagsClientProps {
  initialTags: TagWithCount[]
}

export function TagsClient({ initialTags }: TagsClientProps) {
  const [tags, setTags] = React.useState<TagWithCount[]>(initialTags)
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [editingTag, setEditingTag] = React.useState<TagWithCount | null>(null)

  // 1. Áp dụng Shared Hook: useDebounceSearch
  const { searchTerm, setSearchTerm, debouncedValue } = useDebounceSearch({
    delay: 200,
  })

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

  // 2. Áp dụng Shared Hook: useDeleteConfirm
  const {
    isOpen: isDeleteOpen,
    targetItem: tagToDelete,
    isDeleting,
    openDelete: handleOpenDelete,
    closeDelete: handleCloseDelete,
    confirmDelete,
  } = useDeleteConfirm<TagWithCount>({
    onDelete: async (tag) => {
      const res = await deleteTagAction(tag.id)
      if (!res.success) {
        return { success: false, error: res.error || "Xoá nhãn thất bại" }
      }
      setTags((prev) => prev.filter((t) => t.id !== tag.id))
      return { success: true }
    },
    successMessage: (tag) => `Đã xoá nhãn "${tag.name}"`,
  })

  const filteredTags = React.useMemo(() => {
    return tags.filter((t) =>
      t.name.toLowerCase().includes(debouncedValue.toLowerCase().trim())
    )
  }, [tags, debouncedValue])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <TagsHeader
        onCreateClick={() => {
          setEditingTag(null)
          setCreateModalOpen(true)
        }}
      />

      {/* Search Bar */}
      <TagsSearchBar value={searchTerm} onChange={setSearchTerm} />

      {/* Tags Grid or Empty State */}
      {filteredTags.length === 0 ? (
        <TagEmptyState
          search={searchTerm}
          onCreateClick={() => {
            setEditingTag(null)
            setCreateModalOpen(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              onEdit={(t) => {
                setEditingTag(t)
                setCreateModalOpen(true)
              }}
              onDelete={handleOpenDelete}
            />
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

      {/* Modal Xác nhận xoá dùng chung */}
      <ConfirmDeleteDialog
        isOpen={isDeleteOpen}
        targetItem={tagToDelete}
        isDeleting={isDeleting}
        title={(tag) => `Xác nhận xoá nhãn "${tag.name}"?`}
        description={(tag) => (
          <span>
            Bạn có chắc chắn muốn xoá nhãn &quot;{tag.name}&quot;? Việc này sẽ
            gỡ bỏ nhãn khỏi tất cả {tag.cardCount} thẻ liên quan, nhưng{" "}
            <strong className="text-foreground">không xoá các thẻ</strong> của
            bạn.
          </span>
        )}
        confirmText="Xoá nhãn"
        onClose={handleCloseDelete}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
