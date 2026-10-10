"use client"

import * as React from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { LibraryFolderItem } from "@/types/library"
import { LayoutGrid, List, Search, X } from "lucide-react"

const SORT_OPTIONS = [
  { value: "updatedAt-desc", label: "Mới cập nhật" },
  { value: "createdAt-desc", label: "Mới tạo nhất" },
  { value: "name-asc", label: "Tên (A → Z)" },
  { value: "cardCount-desc", label: "Nhiều thẻ nhất" },
]

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
  const folderOptions = React.useMemo(
    () => [
      { value: "all", label: "Tất cả thư mục" },
      { value: "none", label: "Chưa vào thư mục" },
      ...folders.map((f) => ({ value: f.id, label: `📁 ${f.name}` })),
    ],
    [folders]
  )

  return (
    <div className="border-border bg-card/60 flex flex-col gap-3 rounded-2xl border p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input với InputGroup */}
      <InputGroup className="h-9 max-w-md flex-1">
        <InputGroupAddon align="inline-start">
          <Search className="text-muted-foreground size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Tìm theo tên bộ thẻ, mô tả..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Tìm kiếm bộ thẻ"
          className="text-xs"
        />
        {search && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              onClick={() => onSearchChange("")}
              title="Xóa tìm kiếm"
              aria-label="Xóa nội dung tìm kiếm"
            >
              <X className="size-3.5" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      {/* Filter dropdowns & View toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter by Folder */}
        <div className="min-w-64">
          <Select
            items={folderOptions}
            value={selectedFolder}
            onValueChange={(val) => val && onSelectedFolderChange(val)}
          >
            <SelectTrigger
              aria-label="Lọc theo thư mục"
              className="h-9 w-full text-xs"
            >
              <SelectValue placeholder="Tất cả thư mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {folderOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="min-w-40">
          <Select
            items={SORT_OPTIONS}
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(val) => {
              if (!val) return
              const [sb, so] = val.split("-")
              onSortChange(sb, so)
            }}
          >
            <SelectTrigger
              aria-label="Sắp xếp danh sách"
              className="h-9 w-full text-xs"
            >
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Grid / List View Toggle với ToggleGroup */}
        <ToggleGroup
          value={[viewMode]}
          onValueChange={(val) => {
            const nextMode = val[0]
            if (nextMode === "grid" || nextMode === "list") {
              onViewModeChange(nextMode)
            }
          }}
          spacing={0}
          className="border-border bg-muted/40 rounded-xl border p-0.5"
        >
          <ToggleGroupItem
            value="grid"
            aria-label="Xem dạng lưới"
            title="Xem dạng lưới"
            className="text-muted-foreground hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground size-7 rounded-lg p-0 aria-pressed:shadow-2xs"
          >
            <LayoutGrid className="size-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            aria-label="Xem dạng danh sách"
            title="Xem dạng danh sách"
            className="text-muted-foreground hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground size-7 rounded-lg p-0 aria-pressed:shadow-2xs"
          >
            <List className="size-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
