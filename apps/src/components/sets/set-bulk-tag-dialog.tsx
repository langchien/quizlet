"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TagItem } from "@/types/set-detail"

export interface SetBulkTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  availableTags: TagItem[]
  selectedTagId: string
  onSelectTag: (id: string) => void
  onSubmit: () => void
  isPending?: boolean
}

/**
 * Hộp thoại gán nhãn hàng loạt cho các thẻ đã chọn sử dụng chuẩn Shadcn Dialog
 */
export function SetBulkTagDialog({
  open,
  onOpenChange,
  selectedCount,
  availableTags,
  selectedTagId,
  onSelectTag,
  onSubmit,
  isPending = false,
}: SetBulkTagDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-4">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-sm font-bold">
            Gán nhãn cho {selectedCount} thẻ đã chọn
          </DialogTitle>
          <DialogDescription className="text-xs">
            Chọn nhãn phân loại bạn muốn gán cho tất cả các thẻ này.
          </DialogDescription>
        </DialogHeader>

        <div className="py-1">
          <Select
            value={selectedTagId || undefined}
            onValueChange={(val) => onSelectTag(val || "")}
            disabled={isPending}
          >
            <SelectTrigger className="w-full text-xs">
              <SelectValue placeholder="-- Chọn nhãn --" />
            </SelectTrigger>
            <SelectContent>
              {availableTags.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  🏷️ {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button size="sm" onClick={onSubmit} disabled={isPending}>
            {isPending ? "Đang gán..." : "Gán nhãn ngay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
