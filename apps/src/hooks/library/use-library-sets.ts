"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  getUserSetsAction,
  duplicateSetAction,
  deleteSetAction,
} from "@/actions/sets"
import { getFoldersFlatAction } from "@/actions/folders"
import { useLibraryFilters } from "./use-library-filters"
import { useLibraryModals } from "./use-library-modals"
import type { LibraryStudySetItem, LibraryFolderItem } from "@/types/library"

/**
 * Hook tổng hợp quản lý dữ liệu và toàn bộ nghiệp vụ trang Thư viện
 */
export function useLibrarySets() {
  const filters = useLibraryFilters()
  const modals = useLibraryModals()

  const [sets, setSets] = React.useState<LibraryStudySetItem[]>([])
  const [folders, setFolders] = React.useState<LibraryFolderItem[]>([])
  const [loading, setLoading] = React.useState(true)

  // Tải danh sách thư mục
  React.useEffect(() => {
    getFoldersFlatAction()
      .then((res) => {
        if (res.success && res.data) {
          setFolders(res.data)
        }
      })
      .catch((err) => console.error("Lỗi tải danh sách thư mục:", err))
  }, [])

  // Tải danh sách bộ thẻ theo bộ lọc
  const fetchSets = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await getUserSetsAction({
        search: filters.search.trim() || undefined,
        folderId:
          filters.selectedFolder !== "all" ? filters.selectedFolder : undefined,
        sortBy: filters.sortBy as
          "updatedAt" | "createdAt" | "name" | "cardCount",
        sortOrder: filters.sortOrder as "asc" | "desc",
        limit: 100,
      })

      if (res.success && res.data) {
        setSets(res.data.items as unknown as LibraryStudySetItem[])
      } else {
        toast.error(res.error || "Không thể tải danh sách bộ thẻ")
      }
    } catch (err) {
      console.error("Lỗi khi tải bộ thẻ:", err)
      toast.error("Không thể tải danh sách bộ thẻ")
    } finally {
      setLoading(false)
    }
  }, [
    filters.search,
    filters.selectedFolder,
    filters.sortBy,
    filters.sortOrder,
  ])

  React.useEffect(() => {
    fetchSets()
  }, [fetchSets])

  // Lắng nghe sự kiện refresh từ cửa sổ
  React.useEffect(() => {
    const handleRefresh = () => fetchSets()
    window.addEventListener("refresh-library", handleRefresh)
    return () => window.removeEventListener("refresh-library", handleRefresh)
  }, [fetchSets])

  // Xử lý nhân bản bộ thẻ
  const handleDuplicate = React.useCallback(
    async (id: string, name: string) => {
      try {
        const res = await duplicateSetAction(id, {
          name: `${name} (Bản sao)`,
        })
        if (res.success) {
          toast.success(`Đã nhân bản bộ thẻ "${name}"`)
          fetchSets()
        } else {
          toast.error(res.error || "Nhân bản thất bại")
        }
      } catch {
        toast.error("Lỗi khi nhân bản bộ thẻ")
      }
    },
    [fetchSets]
  )

  // Xử lý xác nhận xoá bộ thẻ
  const confirmDelete = React.useCallback(async () => {
    if (!modals.setToDelete) return
    const { id, name } = modals.setToDelete

    try {
      const res = await deleteSetAction(id)
      if (res.success) {
        toast.success(`Đã xoá bộ thẻ "${name}"`)
        fetchSets()
      } else {
        toast.error(res.error || "Xoá bộ thẻ thất bại")
      }
    } catch {
      toast.error("Lỗi khi xoá bộ thẻ")
    } finally {
      modals.closeDeleteDialog()
    }
  }, [modals, fetchSets])

  return {
    ...filters,
    ...modals,
    sets,
    folders,
    loading,
    fetchSets,
    handleDuplicate,
    confirmDelete,
  }
}

export type UseLibrarySetsReturn = ReturnType<typeof useLibrarySets>
