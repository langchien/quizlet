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
import type { FolderToDelete } from "@/types/sidebar"

interface SidebarDeleteDialogProps {
  folderToDelete: FolderToDelete | null
  onClose: () => void
  onConfirmDelete: () => Promise<void>
}

export function SidebarDeleteDialog({
  folderToDelete,
  onClose,
  onConfirmDelete,
}: SidebarDeleteDialogProps) {
  return (
    <AlertDialog
      open={!!folderToDelete}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xoá thư mục</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xoá thư mục &ldquo;{folderToDelete?.name}
            &rdquo;? Các bộ thẻ bên trong sẽ được tự động chuyển ra thư mục gốc.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Huỷ</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirmDelete}>
            Xoá thư mục
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
