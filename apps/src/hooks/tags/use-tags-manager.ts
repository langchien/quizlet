"use client"

import * as React from "react"
import { deleteTagAction, getTagsAction } from "@/actions/tags"
import type { TagWithCount } from "@/lib/dal/tags"
import { useDeleteConfirm, useDebounceSearch } from "@/hooks/common"

interface UseTagsManagerOptions {
  initialTags: TagWithCount[]
}

export function useTagsManager({ initialTags }: UseTagsManagerOptions) {
  const [tags, setTags] = React.useState<TagWithCount[]>(initialTags)
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [editingTag, setEditingTag] = React.useState<TagWithCount | null>(null)

  // Debounced search
  const { searchTerm, setSearchTerm, debouncedValue } = useDebounceSearch({
    delay: 200,
  })

  // Đồng bộ khi initialTags từ server thay đổi
  React.useEffect(() => {
    setTags(initialTags)
  }, [initialTags])

  const refreshTags = React.useCallback(async () => {
    const res = await getTagsAction()
    if (res.success && res.data) {
      setTags(res.data)
    }
  }, [])

  // Lắng nghe sự kiện cập nhật tags từ window event
  React.useEffect(() => {
    const handleRefresh = () => refreshTags()
    window.addEventListener("refresh-tags", handleRefresh)
    return () => window.removeEventListener("refresh-tags", handleRefresh)
  }, [refreshTags])

  // Hook xác nhận xoá nhãn
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

  // Danh sách nhãn sau khi lọc theo từ khóa tìm kiếm
  const filteredTags = React.useMemo(() => {
    const keyword = debouncedValue.toLowerCase().trim()
    if (!keyword) return tags
    return tags.filter((t) => t.name.toLowerCase().includes(keyword))
  }, [tags, debouncedValue])

  const handleOpenCreateModal = React.useCallback(() => {
    setEditingTag(null)
    setCreateModalOpen(true)
  }, [])

  const handleOpenEditModal = React.useCallback((tag: TagWithCount) => {
    setEditingTag(tag)
    setCreateModalOpen(true)
  }, [])

  return {
    tags,
    filteredTags,
    searchTerm,
    setSearchTerm,
    createModalOpen,
    setCreateModalOpen,
    editingTag,
    handleOpenCreateModal,
    handleOpenEditModal,
    refreshTags,
    // Xoá nhãn
    isDeleteOpen,
    tagToDelete,
    isDeleting,
    handleOpenDelete,
    handleCloseDelete,
    confirmDelete,
  }
}
