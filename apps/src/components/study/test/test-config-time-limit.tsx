"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface TestConfigTimeLimitProps {
  timeLimitMinutes: number
  onTimeLimitChange: (mins: number) => void
}

const TIME_LIMIT_OPTIONS = [
  { label: "Không giới hạn", mins: 0 },
  { label: "5 phút", mins: 5 },
  { label: "10 phút", mins: 10 },
  { label: "20 phút", mins: 20 },
]

export function TestConfigTimeLimit({
  timeLimitMinutes,
  onTimeLimitChange,
}: TestConfigTimeLimitProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <Label className="text-foreground text-xs font-bold tracking-wider uppercase">
        3. Giới hạn thời gian
      </Label>
      <div className="grid grid-cols-4 gap-2">
        {TIME_LIMIT_OPTIONS.map((item) => (
          <Button
            key={item.mins}
            type="button"
            variant={timeLimitMinutes === item.mins ? "default" : "outline"}
            onClick={() => onTimeLimitChange(item.mins)}
            className={cn(
              "rounded-xl text-xs font-bold",
              timeLimitMinutes === item.mins &&
                "bg-purple-600 hover:bg-purple-700"
            )}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
