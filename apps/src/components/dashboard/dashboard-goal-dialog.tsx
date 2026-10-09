"use client"

import * as React from "react"
import { Target, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DashboardGoalDialogProps {
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
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Target className="text-primary size-5" />
            <span>Thiết lập mục tiêu học tập hàng ngày</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cardTarget" className="text-xs font-semibold">
              Mục tiêu số thẻ mỗi ngày (1 - 500 thẻ)
            </Label>
            <Input
              id="cardTarget"
              type="number"
              min={1}
              max={500}
              value={cardTarget}
              onChange={(e) => onCardTargetChange(Number(e.target.value))}
              className="rounded-xl"
            />
            <span className="text-muted-foreground text-[11px]">
              Gợi ý: 20 thẻ/ngày là mức lý tưởng để duy trì phản xạ tiếng Nhật.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="timeTarget" className="text-xs font-semibold">
              Mục tiêu thời gian mỗi ngày (1 - 720 phút)
            </Label>
            <Input
              id="timeTarget"
              type="number"
              min={1}
              max={720}
              value={timeTarget}
              onChange={(e) => onTimeTargetChange(Number(e.target.value))}
              className="rounded-xl"
            />
            <span className="text-muted-foreground text-[11px]">
              Gợi ý: 15-30 phút/ngày giúp hình thành thói quen lâu dài.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button
            onClick={onSave}
            disabled={isPending}
            className="gap-1.5 rounded-xl text-xs"
          >
            <CheckCircle2 className="size-4" />
            <span>{isPending ? "Đang lưu..." : "Lưu mục tiêu"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
