"use client"

import * as React from "react"
import { Trophy, Flame } from "lucide-react"

export interface MatchResultHeaderProps {
  isNewRecord: boolean
  totalPairs: number
}

export function MatchResultHeader({
  isNewRecord,
  totalPairs,
}: MatchResultHeaderProps) {
  return (
    <>
      <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white shadow-xl">
        <Trophy className="size-10" />
      </div>

      {isNewRecord ? (
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-4 py-1 text-xs font-black text-amber-600 dark:text-amber-400">
          <Flame className="size-4 fill-current text-amber-500" />
          <span>KỶ LỤC MỚI CỦA BẠN! 🎉</span>
        </div>
      ) : (
        <span className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600">
          Hoàn thành xuất sắc!
        </span>
      )}

      <h1 className="text-foreground mt-2 text-3xl font-black sm:text-4xl">
        Ghép đôi thành công!
      </h1>
      <p className="text-muted-foreground mt-1 text-xs font-medium">
        Bạn đã ghép đúng toàn bộ {totalPairs} cặp từ vựng trong bộ thẻ.
      </p>
    </>
  )
}
