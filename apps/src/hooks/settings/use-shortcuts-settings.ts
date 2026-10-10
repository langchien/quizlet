"use client"

import * as React from "react"
import { toast } from "sonner"

export function useShortcutsSettings(
  setKeyboardShortcutsEnabled: (enabled: boolean) => void
) {
  const handleResetShortcuts = React.useCallback(() => {
    setKeyboardShortcutsEnabled(true)
    toast.success("Đã khôi phục phím tắt về mặc định.")
  }, [setKeyboardShortcutsEnabled])

  return {
    handleResetShortcuts,
  }
}
