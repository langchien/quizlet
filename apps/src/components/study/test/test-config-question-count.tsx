"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface TestConfigQuestionCountProps {
  totalCards: number
  questionCount: number
  onQuestionCountChange: (count: number) => void
}

export function TestConfigQuestionCount({
  totalCards,
  questionCount,
  onQuestionCountChange,
}: TestConfigQuestionCountProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <Label className="text-foreground text-xs font-bold tracking-wider uppercase">
        1. Số lượng câu hỏi (Tổng {totalCards} thẻ)
      </Label>
      <div className="grid grid-cols-4 gap-2">
        {[5, 10, 20, totalCards].map((num, i) => {
          const label = i === 3 ? `Tất cả (${num})` : `${num} câu`
          const isSelected = questionCount === num
          return (
            <Button
              key={i}
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={() => onQuestionCountChange(num)}
              className={cn(
                "rounded-xl text-xs font-bold",
                isSelected && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              {label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
