"use client"

import * as React from "react"
import { AlertTriangle, RotateCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RestoreConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName?: string
  restoring: boolean
  onConfirm: () => void
}

export function RestoreConfirmDialog({
  open,
  onOpenChange,
  fileName,
  restoring,
  onConfirm,
}: RestoreConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="size-5 shrink-0" />
            Xác nhận phục hồi dữ liệu
          </DialogTitle>
          <DialogDescription className="pt-2 text-xs leading-relaxed">
            Bạn có chắc chắn muốn phục hồi dữ liệu từ file{" "}
            <span className="text-foreground font-mono font-semibold">
              {fileName || "sao lưu"}
            </span>
            ? Quá trình này sẽ thêm lại tất cả thư mục, bộ thẻ, thẻ và lịch sử
            học tập vào tài khoản của bạn.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={restoring}
          >
            Huỷ bỏ
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={restoring}
          >
            {restoring ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                <span>Đang phục hồi...</span>
              </>
            ) : (
              <>
                <RotateCcw data-icon="inline-start" />
                <span>Xác nhận phục hồi ngay</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
