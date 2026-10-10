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

interface DeleteSingleCardDialogProps {
  card: CardItem | null
  onClose: () => void
  onConfirm: () => void
}

/**
 * Sub-component hộp thoại xác nhận xoá một thẻ đơn lẻ
 */
export function DeleteSingleCardDialog({
  card,
  onClose,
  onConfirm,
}: DeleteSingleCardDialogProps) {
  return (
    <AlertDialog open={!!card} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xoá thẻ</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xoá thẻ từ &ldquo;{card?.term}&rdquo;? Thao
            tác này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Huỷ</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Xoá thẻ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface DeleteBulkCardsDialogProps {
  open: boolean
  count: number
  onClose: () => void
  onConfirm: () => void
}

/**
 * Sub-component hộp thoại xác nhận xoá hàng loạt thẻ đã chọn
 */
export function DeleteBulkCardsDialog({
  open,
  count,
  onClose,
  onConfirm,
}: DeleteBulkCardsDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(openChange) => !openChange && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xoá hàng loạt</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xoá {count} thẻ đã chọn? Thao tác này sẽ xoá
            vĩnh viễn và không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Huỷ</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Xoá {count} thẻ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export interface SetDeleteDialogsProps {
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
      <DeleteSingleCardDialog
        card={cardToDelete}
        onClose={onCloseDeleteCard}
        onConfirm={onConfirmDeleteCard}
      />
      <DeleteBulkCardsDialog
        open={bulkDeleteOpen}
        count={selectedCount}
        onClose={onCloseBulkDelete}
        onConfirm={onConfirmBulkDelete}
      />
    </>
  )
}
