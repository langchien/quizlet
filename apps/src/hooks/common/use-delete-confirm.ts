"use client"

import * as React from "react"
import { toast } from "sonner"

export interface UseDeleteConfirmOptions<T> {
  onDelete: (
    item: T
  ) => Promise<{ success: boolean; error?: string } | boolean | void>
  successMessage?: string | ((item: T) => string)
  errorMessage?: string | ((item: T, error?: string) => string)
  onSuccess?: (item: T) => void
  onError?: (item: T, error?: unknown) => void
}

export function useDeleteConfirm<T = unknown>(
  options: UseDeleteConfirmOptions<T>
) {
  const [targetItem, setTargetItem] = React.useState<T | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const openDelete = React.useCallback((item: T) => {
    setTargetItem(item)
  }, [])

  const closeDelete = React.useCallback(() => {
    if (!isDeleting) {
      setTargetItem(null)
    }
  }, [isDeleting])

  const confirmDelete = React.useCallback(async () => {
    if (!targetItem) return

    setIsDeleting(true)
    try {
      const res = await options.onDelete(targetItem)

      // Nếu res là object có success: false
      if (
        typeof res === "object" &&
        res !== null &&
        "success" in res &&
        !res.success
      ) {
        const errMsg =
          typeof options.errorMessage === "function"
            ? options.errorMessage(targetItem, res.error)
            : res.error || options.errorMessage || "Xoá không thành công."
        toast.error(errMsg)
        options.onError?.(targetItem, res.error)
        return
      }

      // Thành công
      const successMsg =
        typeof options.successMessage === "function"
          ? options.successMessage(targetItem)
          : options.successMessage || "Đã xoá thành công."
      toast.success(successMsg)

      options.onSuccess?.(targetItem)
      setTargetItem(null)
    } catch (err: unknown) {
      const errObj = err as { message?: string } | undefined
      const errMsg =
        typeof options.errorMessage === "function"
          ? options.errorMessage(targetItem, errObj?.message)
          : errObj?.message || options.errorMessage || "Có lỗi xảy ra khi xoá."
      toast.error(errMsg)
      options.onError?.(targetItem, err)
    } finally {
      setIsDeleting(false)
    }
  }, [targetItem, options])

  return {
    isOpen: Boolean(targetItem),
    targetItem,
    isDeleting,
    openDelete,
    closeDelete,
    confirmDelete,
  }
}
