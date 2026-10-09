"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  getUserSetsAction,
  duplicateSetAction,
  deleteSetAction,
} from "@/actions/sets"
import { getFoldersFlatAction } from "@/actions/folders"
import type { LibraryStudySetItem, LibraryFolderItem } from "@/types/library"

export function useLibrarySets() {
  const searchParams = useSearchParams()
  const folderParam = searchParams.get("folderId")

  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [sets, setSets] = React.useState<LibraryStudySetItem[]>([])
  const [folders, setFolders] = React.useState<LibraryFolderItem[]>([])
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
  const [editingSet, setEditingSet] =
    React.useState<LibraryStudySetItem | null>(null)
  const [mergeModalOpen, setMergeModalOpen] = React.useState(false)
  const [setToDelete, setSetToDelete] =
    React.useState<LibraryStudySetItem | null>(null)

  // Sync folderParam
  React.useEffect(() => {
    if (folderParam) {
      setSelectedFolder(folderParam)
    }
  }, [folderParam])

  // Fetch Folders
  React.useEffect(() => {
    getFoldersFlatAction()
      .then((res) => {
        if (res.success && res.data) {
          setFolders(res.data)
        }
      })
      .catch((err) => console.error("Error loading folders:", err))
  }, [])

  // Fetch Sets
  const fetchSets = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await getUserSetsAction({
        search: search.trim() || undefined,
        folderId: selectedFolder !== "all" ? selectedFolder : undefined,
        sortBy: sortBy as "updatedAt" | "createdAt" | "name" | "cardCount",
        sortOrder: sortOrder as "asc" | "desc",
        limit: 100,
      })

      if (res.success && res.data) {
        setSets(res.data.items as unknown as LibraryStudySetItem[])
      } else {
        toast.error(res.error || "Không thể tải danh sách bộ thẻ")
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

  const confirmDelete = React.useCallback(async () => {
    if (!setToDelete) return
    const { id, name } = setToDelete

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
      setSetToDelete(null)
    }
  }, [setToDelete, fetchSets])

  return {
    viewMode,
    setViewMode,
    sets,
    folders,
    loading,
    search,
    setSearch,
    selectedFolder,
    setSelectedFolder,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    createModalOpen,
    setCreateModalOpen,
    editingSet,
    setEditingSet,
    mergeModalOpen,
    setMergeModalOpen,
    setToDelete,
    setSetToDelete,
    fetchSets,
    handleDuplicate,
    confirmDelete,
  }
}
