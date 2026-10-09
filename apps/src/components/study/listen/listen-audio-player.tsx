"use client"

import * as React from "react"
import { Volume2, Gauge } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ListenAudioPlayerProps {
  playbackRate: number
  onPlaybackRateChange: (rate: number) => void
  onPlayAudio: (customRate?: number) => void
  isPlaying: boolean
  jlptLevel?: string | null
}

const PLAYBACK_RATES = [0.5, 0.8, 1.0, 1.2]

export function ListenAudioPlayer({
  playbackRate,
  onPlaybackRateChange,
  onPlayAudio,
  isPlaying,
  jlptLevel,
}: ListenAudioPlayerProps) {
  return (
    <div>
      {/* Speed & Audio Controls Bar */}
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

      {/* Big Audio Speaker Action Button */}
      <div className="my-8 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={() => onPlayAudio()}
          className={cn(
            "group relative flex size-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 sm:size-28",
            isPlaying && "ring-4 ring-cyan-500/40"
          )}
          title="Nhấn để nghe phát âm (Phím Cách)"
        >
          <Volume2
            className={cn(
              "size-10 transition-transform sm:size-12",
              isPlaying && "animate-pulse"
            )}
          />
        </button>

        {/* Soundwave animation bars */}
        <div className="mt-4 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full bg-cyan-500 transition-all duration-150",
                isPlaying ? "h-6 animate-bounce" : "h-1 opacity-30"
              )}
              style={{
                animationDelay: `${i * 80}ms`,
                animationDuration: "400ms",
              }}
            />
          ))}
        </div>

        <p className="text-muted-foreground mt-2 text-xs font-medium">
          Nhấn vào loa để nghe lại (hoặc ấn phím Cách)
        </p>
      </div>
    </div>
  )
}
