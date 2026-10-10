"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ListenSoundwaveProps {
  isPlaying: boolean
}

export function ListenSoundwave({ isPlaying }: ListenSoundwaveProps) {
  return (
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
  )
}
