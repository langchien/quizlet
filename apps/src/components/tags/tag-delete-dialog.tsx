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
import type { TagWithCount } from "@/lib/dal/tags"

interface TagDeleteDialogProps {
  tag: TagWithCount | null
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function TagDeleteDialog({
  tag,
  isDeleting,
  onClose,
  onConfirm,
}: TagDeleteDialogProps) {
  return (
    <AlertDialog
      open={Boolean(tag)}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xoá nhãn?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xoá nhãn &quot;{tag?.name}&quot;? Việc này sẽ
            gỡ bỏ nhãn khỏi tất cả {tag?.cardCount} thẻ liên quan, nhưng{" "}
            <strong className="text-foreground">không xoá các thẻ</strong> của
            bạn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Đang xoá..." : "Xoá nhãn"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
