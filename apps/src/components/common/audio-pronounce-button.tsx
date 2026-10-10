"use client"

import * as React from "react"
import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAudioPronounce } from "@/hooks/common/use-audio-pronounce"

export interface AudioPronounceButtonProps {
  text: string
  reading?: string | null
  rate?: number
  size?: "xs" | "sm" | "default" | "icon"
  variant?: "ghost" | "outline" | "secondary" | "default"
  className?: string
  title?: string
  showText?: boolean
  label?: string
  onClick?: (e: React.MouseEvent) => void
}

export function AudioPronounceButton({
  text,
  reading,
  rate = 0.9,
  size = "icon",
  variant = "ghost",
  className,
  title = "Phát âm tiếng Nhật",
  showText = false,
  label,
  onClick,
}: AudioPronounceButtonProps) {
  const { speak, isPlaying, currentText, stop } = useAudioPronounce()
  const toSpeak = reading ? reading : text
  const isThisPlaying = isPlaying && currentText === toSpeak

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    onClick?.(e)

    if (isThisPlaying) {
      stop()
    } else {
      speak(toSpeak, { rate })
    }
  }

  const iconSizes = {
    xs: "size-3",
    sm: "size-3.5",
    default: "size-4",
    icon: "size-4",
  }

  const iconClass = iconSizes[size] || "size-4"

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      title={title}
      aria-label={title}
      className={cn(
        "cursor-pointer transition-all",
        isThisPlaying
          ? "bg-primary/15 text-primary scale-105"
          : "text-muted-foreground hover:text-primary hover:bg-primary/10",
        className
      )}
    >
      {isThisPlaying ? (
        <Volume2 className={cn(iconClass, "animate-pulse")} />
      ) : (
        <Volume2 className={iconClass} />
      )}
      {showText && <span className="ml-1.5 text-xs">{label || "Nghe"}</span>}
    </Button>
  )
}
