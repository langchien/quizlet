"use client"

import * as React from "react"
import { toast } from "sonner"
import { restoreBackupAction } from "@/actions/import"

export interface RestoreSummaryResult {
  restoredFoldersCount: number
  restoredSetsCount: number
  restoredCardsCount: number
  restoredTagsCount: number
  restoredSessionsCount: number
  restoredStatsCount: number
}

export interface UseBackupRestoreOptions {
  onSuccess?: () => void
}

export function useBackupRestore(options?: UseBackupRestoreOptions) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [restoreFile, setRestoreFile] = React.useState<File | null>(null)
  const [restoreConfirmOpen, setRestoreConfirmOpen] = React.useState(false)
  const [restoring, setRestoring] = React.useState(false)
  const [restoreSummary, setRestoreSummary] =
    React.useState<RestoreSummaryResult | null>(null)

  const openFileDialog = React.useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileSelect = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRestoreFile(e.target.files?.[0] || null)
    },
    []
  )

  const handleRequestRestore = React.useCallback(() => {
    if (!restoreFile) {
      toast.error("Vui lòng chọn file sao lưu JSON trước.")
      return
    }
    setRestoreConfirmOpen(true)
  }, [restoreFile])

  const handleRestoreSubmit = async () => {
    if (!restoreFile) {
      toast.error("Vui lòng chọn file backup JSON")
      return
    }

    setRestoring(true)
    const formData = new FormData()
    formData.append("file", restoreFile)

    try {
      const res = await restoreBackupAction(formData)
      if (!res.success || !res.data) {
        toast.error(res.error || "Khôi phục dữ liệu thất bại")
        return
      }

      setRestoreSummary(res.data.summary as RestoreSummaryResult)
      setRestoreConfirmOpen(false)
      toast.success("Khôi phục toàn bộ dữ liệu thành công!")
      options?.onSuccess?.()
    } catch (err) {
      console.error(err)
      toast.error("Lỗi máy chủ khi phục hồi dữ liệu.")
    } finally {
      setRestoring(false)
    }
  }

  const resetSummary = () => setRestoreSummary(null)
  const canRestore = Boolean(restoreFile)

  return {
    restoreFile,
    fileInputRef,
    restoreConfirmOpen,
    restoring,
    restoreSummary,
    canRestore,
    openFileDialog,
    handleFileSelect,
    handleRequestRestore,
    setRestoreFile,
    setRestoreConfirmOpen,
    handleRestoreSubmit,
    resetSummary,
  }
}
