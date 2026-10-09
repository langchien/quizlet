"use client"

import * as React from "react"
import { toast } from "sonner"
import type { FolderNode, FolderToDelete } from "@/types/sidebar"
import { getFoldersTreeAction, deleteFolderAction } from "@/actions/folders"

export function useSidebarFolders() {
  const [folders, setFolders] = React.useState<FolderNode[]>([])
  const [expandedFolderIds, setExpandedFolderIds] = React.useState<Set<string>>(
    new Set()
  )
  const [loadingFolders, setLoadingFolders] = React.useState(true)
  const [folderToDelete, setFolderToDelete] =
    React.useState<FolderToDelete | null>(null)

  const fetchFolders = React.useCallback(async () => {
    try {
      const res = await getFoldersTreeAction()
      if (res.success && res.data) {
        setFolders(res.data)
      }
    } catch (err) {
      console.error("Error fetching folders:", err)
    } finally {
      setLoadingFolders(false)
    }
  }, [])

  React.useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const toggleFolder = React.useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedFolderIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const confirmDeleteFolder = React.useCallback(async () => {
    if (!folderToDelete) return
    const { id, name } = folderToDelete

    try {
      const res = await deleteFolderAction(id)
      if (res.success) {
        toast.success(`Đã xoá thư mục "${name}"`)
        fetchFolders()
      } else {
        toast.error(res.error || "Xoá thư mục thất bại")
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ")
    } finally {
      setFolderToDelete(null)
    }
  }, [folderToDelete, fetchFolders])

  return {
    folders,
    loadingFolders,
    expandedFolderIds,
    folderToDelete,
    setFolderToDelete,
    toggleFolder,
    confirmDeleteFolder,
    fetchFolders,
  }
}
