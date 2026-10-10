"use client"

import * as React from "react"

export interface UseBatchSelectionOptions<T> {
  items?: T[]
  getItemId?: (item: T) => string
}

export function useBatchSelection<T extends { id: string } = { id: string }>(
  options?: UseBatchSelectionOptions<T>
) {
  const items = options?.items
  const customGetItemId = options?.getItemId

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const getItemId = React.useCallback(
    (item: T) => (customGetItemId ? customGetItemId(item) : item.id),
    [customGetItemId]
  )

  const isSelected = React.useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const toggle = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectSingle = React.useCallback((id: string) => {
    setSelectedIds(new Set([id]))
  }, [])

  const selectAll = React.useCallback(
    (ids?: string[]) => {
      if (ids) {
        setSelectedIds(new Set(ids))
      } else if (items) {
        setSelectedIds(new Set(items.map(getItemId)))
      }
    },
    [items, getItemId]
  )

  const deselectAll = React.useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const toggleAll = React.useCallback(
    (allIds?: string[]) => {
      const targetIds = allIds || (items ? items.map(getItemId) : [])
      if (targetIds.length === 0) return

      const isAllCurrentlySelected =
        targetIds.length > 0 && targetIds.every((id) => selectedIds.has(id))

      if (isAllCurrentlySelected) {
        deselectAll()
      } else {
        selectAll(targetIds)
      }
    },
    [items, getItemId, selectedIds, deselectAll, selectAll]
  )

  const isAllSelected = React.useMemo(() => {
    if (!items || items.length === 0) return false
    return (
      selectedIds.size >= items.length &&
      items.every((it) => selectedIds.has(getItemId(it)))
    )
  }, [items, selectedIds, getItemId])

  const selectedItems = React.useMemo(() => {
    if (!items) return []
    return items.filter((it) => selectedIds.has(getItemId(it)))
  }, [items, selectedIds, getItemId])

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isSelected,
    toggle,
    selectSingle,
    selectAll,
    deselectAll,
    toggleAll,
    isAllSelected,
    selectedItems,
    setSelectedIds,
  }
}
