"use client"

import * as React from "react"
import { getUserSetsAction } from "@/actions/sets"

export interface UserSetSummary {
  id: string
  name: string
  cardCount: number
}

export function useExportSets() {
  const [userSets, setUserSets] = React.useState<UserSetSummary[]>([])
  const [loadingSets, setLoadingSets] = React.useState(false)

  const loadUserSets = React.useCallback(async () => {
    try {
      setLoadingSets(true)
      const res = await getUserSetsAction({ limit: 100 })
      if (res.success && res.data) {
        setUserSets(res.data.items || [])
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách bộ thẻ:", err)
    } finally {
      setLoadingSets(false)
    }
  }, [])

  React.useEffect(() => {
    loadUserSets()
  }, [loadUserSets])

  return {
    userSets,
    loadingSets,
    loadUserSets,
  }
}
