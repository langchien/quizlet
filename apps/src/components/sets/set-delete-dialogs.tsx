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
import type { CardItem } from "@/types/set-detail"

interface SetDeleteDialogsProps {
  cardToDelete: CardItem | null
  onCloseDeleteCard: () => void
  onConfirmDeleteCard: () => void
  bulkDeleteOpen: boolean
  selectedCount: number
  onCloseBulkDelete: () => void
  onConfirmBulkDelete: () => void
}

export function SetDeleteDialogs({
  cardToDelete,
  onCloseDeleteCard,
  onConfirmDeleteCard,
  bulkDeleteOpen,
  selectedCount,
  onCloseBulkDelete,
  onConfirmBulkDelete,
}: SetDeleteDialogsProps) {
  return (
    <>
      {/* Delete Single Card Alert Dialog */}
      <AlertDialog
        open={!!cardToDelete}
        onOpenChange={(open) => !open && onCloseDeleteCard()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá thẻ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá thẻ từ &ldquo;{cardToDelete?.term}
              &rdquo;? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCloseDeleteCard}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={onConfirmDeleteCard}
            >
              Xoá thẻ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Bulk Cards Alert Dialog */}
      <AlertDialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => !open && onCloseBulkDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá hàng loạt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá {selectedCount} thẻ đã chọn? Thao tác
              này sẽ xoá vĩnh viễn và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCloseBulkDelete}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={onConfirmBulkDelete}
            >
              Xoá {selectedCount} thẻ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
