"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
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

export interface ConfirmDeleteDialogProps<T> {
  isOpen: boolean
  targetItem: T | null
  isDeleting: boolean
  title?: React.ReactNode | ((item: T) => React.ReactNode)
  description?: React.ReactNode | ((item: T) => React.ReactNode)
  confirmText?: string
  cancelText?: string
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmDeleteDialog<T>({
  isOpen,
  targetItem,
  isDeleting,
  title = "Xác nhận xoá?",
  description = "Thao tác này không thể hoàn tác. Bạn có chắc chắn muốn xoá mục này?",
  confirmText = "Xoá",
  cancelText = "Huỷ",
  onClose,
  onConfirm,
}: ConfirmDeleteDialogProps<T>) {
  if (!targetItem) return null

  const resolvedTitle = typeof title === "function" ? title(targetItem) : title
  const resolvedDescription =
    typeof description === "function" ? description(targetItem) : description

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => !open && !isDeleting && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{resolvedTitle}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
            {resolvedDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={onClose}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
            className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" />
                <span>Đang xoá...</span>
              </span>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
