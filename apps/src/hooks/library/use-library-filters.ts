"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

export type LibraryViewMode = "grid" | "list"

/**
 * Hook quản lý bộ lọc, tìm kiếm, sắp xếp và chế độ xem trong Thư viện
 */
export function useLibraryFilters() {
  const searchParams = useSearchParams()
  const folderParam = searchParams.get("folderId")

  const [viewMode, setViewMode] = React.useState<LibraryViewMode>("grid")
  const [search, setSearch] = React.useState("")
  const [selectedFolder, setSelectedFolder] = React.useState<string>(
    folderParam || "all"
  )
  const [sortBy, setSortBy] = React.useState("updatedAt")
  const [sortOrder, setSortOrder] = React.useState("desc")

  // Đồng bộ folderParam từ URL
  React.useEffect(() => {
    if (folderParam) {
      setSelectedFolder(folderParam)
    }
  }, [folderParam])

  const handleSortChange = React.useCallback(
    (newSortBy: string, newSortOrder: string) => {
      setSortBy(newSortBy)
      setSortOrder(newSortOrder)
    },
    []
  )

  const clearSearch = React.useCallback(() => {
    setSearch("")
  }, [])

  return {
    viewMode,
    setViewMode,
    search,
    setSearch,
    clearSearch,
    selectedFolder,
    setSelectedFolder,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    handleSortChange,
  }
}

export type UseLibraryFiltersReturn = ReturnType<typeof useLibraryFilters>
