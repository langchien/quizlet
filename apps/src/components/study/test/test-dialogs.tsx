"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmSubmitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  answeredCount: number
  totalQuestions: number
  onConfirm: () => void
}

export function ConfirmSubmitDialog({
  open,
  onOpenChange,
  answeredCount,
  totalQuestions,
  onConfirm,
}: ConfirmSubmitDialogProps) {
  const isAllAnswered = answeredCount >= totalQuestions

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            {!isAllAnswered ? (
              <AlertTriangle className="size-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="size-5 text-emerald-500" />
            )}
            <span>Xác nhận nộp bài kiểm tra</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {!isAllAnswered ? (
              <span className="font-semibold text-rose-500">
                Bạn còn {totalQuestions - answeredCount} câu chưa làm bài! Bạn
                có chắc chắn muốn nộp ngay không?
              </span>
            ) : (
              <span>
                Bạn đã hoàn thành tất cả {totalQuestions} câu hỏi. Sẵn sàng nhận
                kết quả chấm điểm?
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            Làm tiếp
          </Button>
          <Button
            onClick={onConfirm}
            className="rounded-xl bg-purple-600 text-xs font-bold text-white hover:bg-purple-700"
          >
            Nộp bài ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ExitConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExit: () => void
}

export function ExitConfirmDialog({
  open,
  onOpenChange,
  onExit,
}: ExitConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận thoát bài thi</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn thoát khỏi bài thi hiện tại? Tiến trình và kết quả
            làm bài sẽ bị huỷ.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Tiếp tục làm bài
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              onOpenChange(false)
              onExit()
            }}
          >
            Thoát bài thi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
