"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarDayActionProps {
  canStartStudy: boolean
}

export function CalendarDayAction({ canStartStudy }: CalendarDayActionProps) {
  return (
    <div className="border-border/50 mt-4 border-t pt-4">
      {canStartStudy ? (
        <Button
          render={<Link href="/study/mistakes" />}
          className="w-full gap-2 rounded-2xl bg-emerald-600 py-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
        >
          <Play className="size-4 fill-current" />
          <span>Bắt đầu phiên ôn tập ngay</span>
        </Button>
      ) : (
        <Button
          render={<Link href="/library" />}
          variant="outline"
          className="w-full gap-2 rounded-2xl py-5 text-xs"
        >
          <BookOpen className="size-4" />
          <span>Khám phá các bộ thẻ khác</span>
        </Button>
      )}
    </div>
  )
}
