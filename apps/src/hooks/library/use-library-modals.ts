"use client"

import * as React from "react"
import type { LibraryStudySetItem } from "@/types/library"

/**
 * Hook quản lý trạng thái các modal trong trang Thư viện (Tạo mới, Sửa, Gộp, Xoá)
 */
export function useLibraryModals() {
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [editingSet, setEditingSet] =
    React.useState<LibraryStudySetItem | null>(null)
  const [mergeModalOpen, setMergeModalOpen] = React.useState(false)
  const [setToDelete, setSetToDelete] =
    React.useState<LibraryStudySetItem | null>(null)

  const openCreateModal = React.useCallback(() => {
    setEditingSet(null)
    setCreateModalOpen(true)
  }, [])

  const openEditModal = React.useCallback((set: LibraryStudySetItem) => {
    setEditingSet(set)
    setCreateModalOpen(true)
  }, [])

  const openMergeModal = React.useCallback(() => {
    setMergeModalOpen(true)
  }, [])

  const openDeleteDialog = React.useCallback((set: LibraryStudySetItem) => {
    setSetToDelete(set)
  }, [])

  const closeDeleteDialog = React.useCallback(() => {
    setSetToDelete(null)
  }, [])

  return {
    createModalOpen,
    setCreateModalOpen,
    editingSet,
    setEditingSet,
    mergeModalOpen,
    setMergeModalOpen,
    setToDelete,
    setSetToDelete,
    openCreateModal,
    openEditModal,
    openMergeModal,
    openDeleteDialog,
    closeDeleteDialog,
  }
}

export type UseLibraryModalsReturn = ReturnType<typeof useLibraryModals>
