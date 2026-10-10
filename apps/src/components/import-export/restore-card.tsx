"use client"

import * as React from "react"
import { RotateCcw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RestoreSummaryView } from "./restore-summary-dialog"
import type { RestoreSummaryResult } from "@/hooks/import-export/use-backup-restore"

interface RestoreCardProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRequestRestore: () => void
  canRestore: boolean
  restoring: boolean
  summary: RestoreSummaryResult | null
}

export function RestoreCard({
  fileInputRef,
  onFileSelect,
  onRequestRestore,
  canRestore,
  restoring,
  summary,
}: RestoreCardProps) {
  return (
    <Card className="border-amber-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-amber-600 dark:text-amber-400">
          <RotateCcw className="size-5" />
          <span>Phục hồi dữ liệu (Restore)</span>
        </CardTitle>
        <CardDescription>
          Khôi phục lại toàn bộ dữ liệu từ file sao lưu JSON đã tải về trước đó.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-xs">
            <span className="font-semibold">Lưu ý quan trọng:</span> Quá trình
            phục hồi sẽ tái tạo lại các thư mục, bộ thẻ, thẻ từ vựng và lịch sử
            học tập từ file sao lưu.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={onFileSelect}
            className="text-xs"
          />
          <Button
            onClick={onRequestRestore}
            disabled={!canRestore || restoring}
            variant="outline"
            size="sm"
            className="shrink-0 font-semibold"
          >
            <RotateCcw data-icon="inline-start" />
            <span>Tiến hành phục hồi</span>
          </Button>
        </div>

        <RestoreSummaryView summary={summary} />
      </CardContent>
    </Card>
  )
}
