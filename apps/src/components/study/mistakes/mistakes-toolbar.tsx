"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MistakesToolbarFilterItem } from "./mistakes-toolbar-filter-item"

interface MistakesToolbarProps {
  selectedSetId: string
  selectedJLPT: string
  sortBy: string
  uniqueSets: Array<{ id: string; name: string }>
  isFilterPending: boolean
  onFilterChange: (
    newSetId?: string,
    newJLPT?: string,
    newSortBy?: string
  ) => void
}

export function MistakesToolbar({
  selectedSetId,
  selectedJLPT,
  sortBy,
  uniqueSets,
  isFilterPending,
  onFilterChange,
}: MistakesToolbarProps) {
  return (
    <div className="border-border/60 bg-muted/40 mt-8 grid grid-cols-1 gap-3 rounded-2xl border p-3 sm:grid-cols-3">
      {/* Lọc theo Bộ thẻ */}
      <MistakesToolbarFilterItem label="Bộ thẻ:">
        <Select
          value={selectedSetId}
          onValueChange={(val) =>
            val && onFilterChange(val, selectedJLPT, sortBy)
          }
          disabled={isFilterPending}
        >
          <SelectTrigger className="h-9 w-full text-xs font-medium">
            <SelectValue placeholder="Tất cả bộ thẻ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả bộ thẻ</SelectItem>
            {uniqueSets.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </MistakesToolbarFilterItem>

      {/* Lọc theo JLPT */}
      <MistakesToolbarFilterItem label="Cấp độ JLPT:">
        <Select
          value={selectedJLPT}
          onValueChange={(val) =>
            val && onFilterChange(selectedSetId, val, sortBy)
          }
          disabled={isFilterPending}
        >
          <SelectTrigger className="h-9 w-full text-xs font-medium">
            <SelectValue placeholder="Tất cả cấp độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả cấp độ</SelectItem>
            <SelectItem value="N5">N5</SelectItem>
            <SelectItem value="N4">N4</SelectItem>
            <SelectItem value="N3">N3</SelectItem>
            <SelectItem value="N2">N2</SelectItem>
            <SelectItem value="N1">N1</SelectItem>
          </SelectContent>
        </Select>
      </MistakesToolbarFilterItem>

      {/* Sắp xếp */}
      <MistakesToolbarFilterItem label="Sắp xếp theo:">
        <Select
          value={sortBy}
          onValueChange={(val) =>
            val && onFilterChange(selectedSetId, selectedJLPT, val)
          }
          disabled={isFilterPending}
        >
          <SelectTrigger className="h-9 w-full text-xs font-medium">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="incorrectCount">
              Số lần sai nhiều nhất
            </SelectItem>
            <SelectItem value="leastAccurate">
              Độ chính xác thấp nhất
            </SelectItem>
            <SelectItem value="lastReviewDate">Mới ôn gần đây</SelectItem>
          </SelectContent>
        </Select>
      </MistakesToolbarFilterItem>
    </div>
  )
}
