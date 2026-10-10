"use client"

import * as React from "react"
import Link from "next/link"
import { Zap, BookOpen } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface MatchResultActionsProps {
  setId: string
  onRestart: () => void
}

export function MatchResultActions({
  setId,
  onRestart,
}: MatchResultActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        onClick={onRestart}
        className="gap-2 rounded-xl bg-rose-600 font-bold text-white shadow-xs hover:bg-rose-700"
      >
        <Zap className="size-4 fill-current" />
        <span>Chơi lại ván mới</span>
      </Button>

      <Link
        href={`/sets/${setId}`}
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "gap-2 rounded-xl"
        )}
      >
        <BookOpen className="size-4" />
        <span>Về bộ thẻ</span>
      </Link>
    </div>
  )
}
