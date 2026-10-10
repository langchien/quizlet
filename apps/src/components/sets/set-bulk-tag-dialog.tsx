"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TagItem } from "@/types/set-detail"

interface SetBulkTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  availableTags: TagItem[]
  selectedTagId: string
  onSelectTag: (id: string) => void
  onSubmit: () => void
  isPending?: boolean
}

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
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />
      <div className="border-border bg-card animate-in zoom-in-95 relative z-50 flex w-full max-w-sm flex-col gap-4 rounded-2xl border p-5 shadow-xl">
        <div className="flex flex-col gap-1">
          <h3 className="text-foreground text-sm font-bold">
            Gán nhãn cho {selectedCount} thẻ đã chọn
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Chọn nhãn phân loại bạn muốn gán cho tất cả các thẻ này.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
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

        <div className="flex justify-end gap-2 pt-1">
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
        </div>
      </div>
    </div>
  )
}
