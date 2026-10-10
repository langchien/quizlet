"use client"

import * as React from "react"
import type { RecentSetItem } from "@/types/dashboard"

export interface UseRecentSetsProps {
  recentSets?: RecentSetItem[]
}

/**
 * Hook xử lý dữ liệu danh sách bộ thẻ gần đây
 */
export function useRecentSets({ recentSets = [] }: UseRecentSetsProps) {
  const sets = React.useMemo(() => recentSets ?? [], [recentSets])
  const hasSets = sets.length > 0

  return {
    sets,
    hasSets,
  }
}
