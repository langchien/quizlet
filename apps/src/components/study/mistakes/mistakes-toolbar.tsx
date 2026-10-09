"use client"

import * as React from "react"

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
      <div>
        <label className="text-muted-foreground mb-1 block text-[11px] font-bold">
          Bộ thẻ:
        </label>
        <select
          value={selectedSetId}
          onChange={(e) => onFilterChange(e.target.value, selectedJLPT, sortBy)}
          disabled={isFilterPending}
          className="border-input bg-card text-foreground h-9 w-full rounded-xl border px-3 text-xs font-medium focus:outline-none"
        >
          <option value="all">Tất cả bộ thẻ</option>
          {uniqueSets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lọc theo JLPT */}
      <div>
        <label className="text-muted-foreground mb-1 block text-[11px] font-bold">
          Cấp độ JLPT:
        </label>
        <select
          value={selectedJLPT}
          onChange={(e) =>
            onFilterChange(selectedSetId, e.target.value, sortBy)
          }
          disabled={isFilterPending}
          className="border-input bg-card text-foreground h-9 w-full rounded-xl border px-3 text-xs font-medium focus:outline-none"
        >
          <option value="all">Tất cả cấp độ</option>
          <option value="N5">N5</option>
          <option value="N4">N4</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>
      </div>

      {/* Sắp xếp */}
      <div>
        <label className="text-muted-foreground mb-1 block text-[11px] font-bold">
          Sắp xếp theo:
        </label>
        <select
          value={sortBy}
          onChange={(e) =>
            onFilterChange(selectedSetId, selectedJLPT, e.target.value)
          }
          disabled={isFilterPending}
          className="border-input bg-card text-foreground h-9 w-full rounded-xl border px-3 text-xs font-medium focus:outline-none"
        >
          <option value="incorrectCount">Số lần sai nhiều nhất</option>
          <option value="leastAccurate">Độ chính xác thấp nhất</option>
          <option value="lastReviewDate">Mới ôn gần đây</option>
        </select>
      </div>
    </div>
  )
}
