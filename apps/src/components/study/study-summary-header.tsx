"use client"

import * as React from "react"
import { Trophy, Layers } from "lucide-react"

export interface StudySummaryHeaderProps {
  accuracy: number
  setName?: string
  mode: string
}

export function StudySummaryHeader({
  accuracy,
  setName,
  mode,
}: StudySummaryHeaderProps) {
  const encouragement = React.useMemo(() => {
    if (accuracy === 100) return "Xuất sắc! Bạn đã ghi nhớ toàn bộ thẻ!"
    if (accuracy >= 80) return "Rất tốt! Bạn đang tiến bộ vượt bậc!"
    if (accuracy >= 50) return "Khá tốt! Hãy ôn lại các thẻ chưa thuộc nhé!"
    return "Đừng nản lòng! Luyện tập nhiều hơn sẽ giúp bạn ghi nhớ sâu!"
  }, [accuracy])

  return (
    <>
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-white shadow-md">
        <Trophy className="size-8" />
      </div>

      <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
        Hoàn thành phiên học!
      </h2>
      <p className="text-muted-foreground mt-1 text-sm font-medium">
        {encouragement}
      </p>

      {(setName || mode) && (
        <div className="bg-muted/50 text-foreground/80 mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold">
          <Layers className="text-primary size-3.5" />
          <span>{setName || "Bộ thẻ học"}</span>
          <span>•</span>
          <span className="text-primary capitalize">{mode}</span>
        </div>
      )}
    </>
  )
}
