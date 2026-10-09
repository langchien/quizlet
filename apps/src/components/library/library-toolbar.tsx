"use client"

import * as React from "react"
import { Search, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { NativeSelect as Select } from "@/components/ui/native-select"
import { cn } from "@/lib/utils"
import type { LibraryFolderItem } from "@/types/library"

interface LibraryToolbarProps {
  search: string
  onSearchChange: (val: string) => void
  selectedFolder: string
  onSelectedFolderChange: (val: string) => void
  folders: LibraryFolderItem[]
  sortBy: string
  sortOrder: string
  onSortChange: (sortBy: string, sortOrder: string) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

export function LibraryToolbar({
  search,
  onSearchChange,
  selectedFolder,
  onSelectedFolderChange,
  folders,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
}: LibraryToolbarProps) {
  return (
    <div className="border-border bg-card/60 flex flex-col gap-3 rounded-2xl border p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative max-w-md flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Tìm theo tên bộ thẻ, mô tả..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-9 text-xs"
        />
      </div>

      {/* Filter dropdowns & View toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter by Folder */}
        <div className="min-w-[140px]">
          <Select
            value={selectedFolder}
            onChange={(e) => onSelectedFolderChange(e.target.value)}
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
              onSortChange(sb, so)
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
            onClick={() => onViewModeChange("grid")}
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
            onClick={() => onViewModeChange("list")}
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
  )
}
