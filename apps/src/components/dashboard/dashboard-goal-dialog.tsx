"use client"

import * as React from "react"
import { Target } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GoalDialogFields } from "./goal-dialog-fields"
import { GoalDialogFooter } from "./goal-dialog-footer"

export interface DashboardGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cardTarget: number
  onCardTargetChange: (value: number) => void
  timeTarget: number
  onTimeTargetChange: (value: number) => void
  onSave: () => void
  isPending?: boolean
}

export function DashboardGoalDialog({
  open,
  onOpenChange,
  cardTarget,
  onCardTargetChange,
  timeTarget,
  onTimeTargetChange,
  onSave,
  isPending = false,
}: DashboardGoalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Target className="text-primary size-5" />
            <span>Thiết lập mục tiêu học tập hàng ngày</span>
          </DialogTitle>
        </DialogHeader>

        <GoalDialogFields
          cardTarget={cardTarget}
          onCardTargetChange={onCardTargetChange}
          timeTarget={timeTarget}
          onTimeTargetChange={onTimeTargetChange}
        />

        <GoalDialogFooter
          onCancel={() => onOpenChange(false)}
          onSave={onSave}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
