"use client"

import * as React from "react"
import { BackupFullCard } from "./backup-full-card"
import { ExportSetsTab } from "./export-sets-tab"
import { RestoreCard } from "./restore-card"
import { RestoreConfirmDialog } from "./restore-confirm-dialog"
import { useBackupRestore } from "@/hooks/import-export/use-backup-restore"
import type { UserSetSummary } from "@/hooks/import-export/use-export-sets"

interface BackupRestoreTabProps {
  userSets: UserSetSummary[]
  loadingSets: boolean
  onRestoreSuccess?: () => void
}

export function BackupRestoreTab({
  userSets,
  loadingSets,
  onRestoreSuccess,
}: BackupRestoreTabProps) {
  const {
    restoreFile,
    fileInputRef,
    restoreConfirmOpen,
    restoring,
    restoreSummary,
    canRestore,
    handleFileSelect,
    handleRequestRestore,
    setRestoreConfirmOpen,
    handleRestoreSubmit,
  } = useBackupRestore({
    onSuccess: onRestoreSuccess,
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: Full Backup */}
      <BackupFullCard />

      {/* Section 2: Export Individual Sets */}
      <ExportSetsTab userSets={userSets} loadingSets={loadingSets} />

      {/* Section 3: Restore Data */}
      <RestoreCard
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
        onRequestRestore={handleRequestRestore}
        canRestore={canRestore}
        restoring={restoring}
        summary={restoreSummary}
      />

      {/* Modal xác nhận phục hồi */}
      <RestoreConfirmDialog
        open={restoreConfirmOpen}
        onOpenChange={setRestoreConfirmOpen}
        fileName={restoreFile?.name}
        restoring={restoring}
        onConfirm={handleRestoreSubmit}
      />
    </div>
  )
}
