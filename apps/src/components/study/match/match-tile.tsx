"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { MatchTile as MatchTileType } from "@/types/match"

interface MatchTileProps {
  tile: MatchTileType
  isSelected: boolean
  onTileClick: (tile: MatchTileType) => void
}

export function MatchTile({ tile, isSelected, onTileClick }: MatchTileProps) {
  return (
    <button
      type="button"
      disabled={tile.isMatched}
      onClick={() => onTileClick(tile)}
      className={cn(
        "relative flex min-h-[110px] flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-200 select-none sm:min-h-[130px]",
        // Trạng thái đã ghép xong: mờ dần và biến mất
        tile.isMatched
          ? "pointer-events-none scale-90 opacity-0 transition-opacity duration-300"
          : "scale-100 opacity-100 shadow-sm",
        // Trạng thái bình thường
        !isSelected &&
          !tile.isWrong &&
          "border-border bg-card hover:bg-muted/40 hover:border-rose-400",
        // Trạng thái đang được chọn
        isSelected &&
          "scale-105 border-rose-500 bg-rose-500/10 text-rose-700 shadow-md ring-2 ring-rose-500 dark:text-rose-300",
        // Trạng thái ghép sai (rung lắc/nảy)
        tile.isWrong &&
          "animate-bounce border-rose-600 bg-rose-500/20 text-rose-600"
      )}
    >
      {tile.type === "term" ? (
        <>
          <span className="font-japanese text-foreground text-lg font-black sm:text-xl">
            {tile.text}
          </span>
          {tile.subText && (
            <span className="font-japanese text-muted-foreground mt-1 text-xs font-medium">
              {tile.subText}
            </span>
          )}
          <Badge variant="outline" className="mt-2 text-[9px] font-semibold">
            Tiếng Nhật
          </Badge>
        </>
      ) : (
        <>
          <span className="text-foreground text-sm leading-snug font-bold sm:text-base">
            {tile.text}
          </span>
          <Badge variant="outline" className="mt-2 text-[9px] font-semibold">
            Định nghĩa
          </Badge>
        </>
      )}
    </button>
  )
}
