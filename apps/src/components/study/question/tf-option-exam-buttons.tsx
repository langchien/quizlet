"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface TfOptionExamButtonsProps {
  userAnswer?: string
  disabled?: boolean
  onSelect: (choice: "true" | "false") => void
}

export function TfOptionExamButtons({
  userAnswer,
  disabled = false,
  onSelect,
}: TfOptionExamButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={disabled}
        onClick={() => onSelect("false")}
        className={cn(
          "h-14 rounded-2xl border-rose-500/30 text-base font-bold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
          userAnswer === "false" &&
            "border-rose-600 bg-rose-500/20 font-black text-rose-700 ring-2 ring-rose-500"
        )}
      >
        <X className="size-5" />
        <span>Sai ❌</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={disabled}
        onClick={() => onSelect("true")}
        className={cn(
          "h-14 rounded-2xl border-emerald-500/30 text-base font-bold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400",
          userAnswer === "true" &&
            "border-emerald-600 bg-emerald-500/20 font-black text-emerald-700 ring-2 ring-emerald-500"
        )}
      >
        <Check className="size-5" />
        <span>Đúng ✅</span>
      </Button>
    </div>
  )
}
