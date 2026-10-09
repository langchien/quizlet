"use client"

import * as React from "react"
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
import type { LibraryStudySetItem } from "@/types/library"

interface LibraryDeleteDialogProps {
  setToDelete: LibraryStudySetItem | null
  onClose: () => void
  onConfirmDelete: () => void
}

export function LibraryDeleteDialog({
  setToDelete,
  onClose,
  onConfirmDelete,
}: LibraryDeleteDialogProps) {
  return (
    <AlertDialog
      open={!!setToDelete}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xoá bộ thẻ</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xoá bộ thẻ &ldquo;{setToDelete?.name}&rdquo;?
            Thao tác này sẽ xoá vĩnh viễn toàn bộ các thẻ bên trong và không thể
            hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Huỷ</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirmDelete}>
            Xoá bộ thẻ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
