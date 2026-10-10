"use client"

import * as React from "react"
import { useAppStore } from "@/stores/useAppStore"
import type { JLPTLevel } from "@/types"

/**
 * Hook quản lý lựa chọn cấp độ JLPT trên Landing Page
 */
export function useLandingJlpt() {
  const { selectedJLPTLevel, setSelectedJLPTLevel } = useAppStore()

  const handleSelectLevel = React.useCallback(
    (level: JLPTLevel | "ALL") => {
      setSelectedJLPTLevel(level)
    },
    [setSelectedJLPTLevel]
  )

  return {
    selectedLevel: selectedJLPTLevel,
    handleSelectLevel,
  }
}

export type UseLandingJlptReturn = ReturnType<typeof useLandingJlpt>
