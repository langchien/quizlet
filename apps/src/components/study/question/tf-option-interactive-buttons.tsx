"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface TfOptionInteractiveButtonsProps {
  isTrue?: boolean
  showFeedback?: boolean
  disabled?: boolean
  onSelect: (choice: "true" | "false") => void
}

export function TfOptionInteractiveButtons({
  isTrue,
  showFeedback = false,
  disabled = false,
  onSelect,
}: TfOptionInteractiveButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={showFeedback || disabled}
        onClick={() => onSelect("false")}
        className={cn(
          "h-14 gap-2 rounded-2xl border-rose-500/30 text-base font-bold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
          showFeedback &&
            !isTrue &&
            "border-emerald-500 bg-emerald-500/10 font-black text-emerald-600"
        )}
      >
        <X className="size-5" />
        <span>Sai ❌</span>
      </Button>

      <Button
        type="button"
        size="lg"
        disabled={showFeedback || disabled}
        onClick={() => onSelect("true")}
        className={cn(
          "h-14 gap-2 rounded-2xl bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700",
          showFeedback && isTrue && "bg-emerald-600 font-black"
        )}
      >
        <Check className="size-5" />
        <span>Đúng ✅</span>
      </Button>
    </div>
  )
}
