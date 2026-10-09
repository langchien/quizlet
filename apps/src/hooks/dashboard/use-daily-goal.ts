"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateGoalAction } from "@/actions/goals"

interface UseDailyGoalProps {
  dailyGoal?: {
    cardTarget: number
    timeTargetMinutes: number
  }
}

export function useDailyGoal({ dailyGoal }: UseDailyGoalProps) {
  const router = useRouter()
  const [goalDialogOpen, setGoalDialogOpen] = React.useState(false)
  const [cardTargetInput, setCardTargetInput] = React.useState(
    dailyGoal?.cardTarget ?? 20
  )
  const [timeTargetInput, setTimeTargetInput] = React.useState(
    dailyGoal?.timeTargetMinutes ?? 15
  )
  const [isPending, startTransition] = React.useTransition()

  // Cập nhật lại input khi dailyGoal props thay đổi
  React.useEffect(() => {
    if (dailyGoal) {
      setCardTargetInput(dailyGoal.cardTarget)
      setTimeTargetInput(dailyGoal.timeTargetMinutes)
    }
  }, [dailyGoal])

  const handleSaveGoal = () => {
    startTransition(async () => {
      try {
        const res = await updateGoalAction({
          dailyCardTarget: Number(cardTargetInput),
          dailyTimeTarget: Number(timeTargetInput),
        })

        if (!res.success) {
          toast.error(res.error || "Không thể cập nhật mục tiêu")
          return
        }

        toast.success("Đã cập nhật mục tiêu học tập hàng ngày!")
        setGoalDialogOpen(false)
        router.refresh()
      } catch (err) {
        console.error(err)
        toast.error("Có lỗi xảy ra khi lưu mục tiêu.")
      }
    })
  }

  return {
    goalDialogOpen,
    setGoalDialogOpen,
    cardTargetInput,
    setCardTargetInput,
    timeTargetInput,
    setTimeTargetInput,
    isPending,
    handleSaveGoal,
  }
}
