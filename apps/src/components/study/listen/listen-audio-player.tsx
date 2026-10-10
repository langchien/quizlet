"use client"

import * as React from "react"
import { Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ListenPlaybackRateBar } from "./listen-playback-rate-bar"
import { ListenSoundwave } from "./listen-soundwave"

interface ListenAudioPlayerProps {
  playbackRate: number
  onPlaybackRateChange: (rate: number) => void
  onPlayAudio: (customRate?: number) => void
  isPlaying: boolean
  jlptLevel?: string | null
}

export function ListenAudioPlayer({
  playbackRate,
  onPlaybackRateChange,
  onPlayAudio,
  isPlaying,
  jlptLevel,
}: ListenAudioPlayerProps) {
  return (
    <div>
      <ListenPlaybackRateBar
        playbackRate={playbackRate}
        onPlaybackRateChange={onPlaybackRateChange}
        onPlayAudio={onPlayAudio}
        jlptLevel={jlptLevel}
      />

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

        <ListenSoundwave isPlaying={isPlaying} />

        <p className="text-muted-foreground mt-2 text-xs font-medium">
          Nhấn vào loa để nghe lại (hoặc ấn phím Cách)
        </p>
      </div>
    </div>
  )
}
