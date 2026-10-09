"use client"

import * as React from "react"
import { Download, RotateCcw, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ExportSetsTab } from "./export-sets-tab"
import { RestoreConfirmDialog } from "./restore-confirm-dialog"
import { RestoreSummaryView } from "./restore-summary-dialog"
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
    restoreConfirmOpen,
    restoring,
    restoreSummary,
    setRestoreFile,
    setRestoreConfirmOpen,
    handleRestoreSubmit,
  } = useBackupRestore({
    onSuccess: onRestoreSuccess,
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: Full Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="text-primary size-5" />
            Sao lưu toàn bộ dữ liệu (Full Backup)
          </CardTitle>
          <CardDescription>
            Tải về toàn bộ cơ sở dữ liệu học tập cá nhân bao gồm: tất cả thư
            mục, bộ thẻ, thẻ, tiến độ SRS, lịch sử phiên học, thống kê hàng ngày
            và mục tiêu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-primary/20 bg-primary/5 flex flex-col items-start justify-between gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <div className="text-foreground text-sm font-semibold">
                Bản sao lưu hoàn chỉnh (.json)
              </div>
              <div className="text-muted-foreground text-xs">
                An toàn, toàn vẹn 100%, có thể khôi phục lại bất kỳ lúc nào trên
                mọi máy tính.
              </div>
            </div>
            <a
              href="/api/export/backup"
              download
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="size-4" />
              <span>Tải bản sao lưu toàn bộ</span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Export Individual Sets */}
      <ExportSetsTab userSets={userSets} loadingSets={loadingSets} />

      {/* Section 3: Restore Data */}
      <Card className="border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-amber-600 dark:text-amber-400">
            <RotateCcw className="size-5" />
            Phục hồi dữ liệu (Restore)
          </CardTitle>
          <CardDescription>
            Khôi phục lại toàn bộ dữ liệu từ file sao lưu JSON đã tải về trước
            đó.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-semibold">Lưu ý quan trọng:</span> Quá trình
              phục hồi sẽ tái tạo lại các thư mục, bộ thẻ, thẻ từ vựng và lịch
              sử học tập từ file sao lưu.
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Input
              type="file"
              accept=".json"
              onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
              className="text-xs"
            />
            <Button
              onClick={() => {
                if (!restoreFile) {
                  toast.error("Vui lòng chọn file sao lưu JSON trước.")
                  return
                }
                setRestoreConfirmOpen(true)
              }}
              disabled={!restoreFile || restoring}
              variant="outline"
              className="shrink-0 gap-2 rounded-xl text-xs font-semibold"
            >
              <RotateCcw className="size-4" />
              <span>Tiến hành phục hồi</span>
            </Button>
          </div>

          <RestoreSummaryView summary={restoreSummary} />
        </CardContent>
      </Card>

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
