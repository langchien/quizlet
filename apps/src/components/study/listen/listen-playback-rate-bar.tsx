"use client"

import * as React from "react"
import { Gauge } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ListenPlaybackRateBarProps {
  playbackRate: number
  onPlaybackRateChange: (rate: number) => void
  onPlayAudio: (customRate?: number) => void
  jlptLevel?: string | null
}

const PLAYBACK_RATES = [0.5, 0.8, 1.0, 1.2]

export function ListenPlaybackRateBar({
  playbackRate,
  onPlaybackRateChange,
  onPlayAudio,
  jlptLevel,
}: ListenPlaybackRateBarProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Gauge className="text-muted-foreground size-3.5" />
        <span className="text-muted-foreground text-xs font-medium">
          Tốc độ:
        </span>
        {PLAYBACK_RATES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              onPlaybackRateChange(r)
              onPlayAudio(r)
            }}
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-bold transition-colors",
              playbackRate === r
                ? "bg-cyan-500 text-white shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {r}x
          </button>
        ))}
      </div>

      {jlptLevel && (
        <Badge variant="outline" className="text-[10px]">
          {jlptLevel}
        </Badge>
      )}
    </div>
  )
}
