"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export interface GoalDialogFooterProps {
  onCancel: () => void
  onSave: () => void
  isPending?: boolean
}

export function GoalDialogFooter({
  onCancel,
  onSave,
  isPending = false,
}: GoalDialogFooterProps) {
  return (
    <DialogFooter className="gap-2 sm:gap-0">
      <Button
        variant="outline"
        onClick={onCancel}
        className="rounded-xl text-xs"
        disabled={isPending}
      >
        Huỷ
      </Button>
      <Button
        onClick={onSave}
        disabled={isPending}
        className="rounded-xl text-xs"
      >
        {isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <CheckCircle2 data-icon="inline-start" className="size-4" />
        )}
        <span>{isPending ? "Đang lưu..." : "Lưu mục tiêu"}</span>
      </Button>
    </DialogFooter>
  )
}
