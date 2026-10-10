"use client"

import * as React from "react"
import { cn } from "cn"

interface ImportDropzoneProps {
  file: File | null
  accept: string
  placeholder: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDropzoneClick: () => void
  disabled?: boolean
  className?: string
  sizeText?: string
}

export function ImportDropzone({
  file,
  accept,
  placeholder,
  description,
  icon: Icon,
  fileInputRef,
  onFileChange,
  onDropzoneClick,
  disabled,
  className,
  sizeText,
}: ImportDropzoneProps) {
  const displaySize = React.useMemo(() => {
    if (sizeText) return sizeText
    if (!file) return description
    if (file.size >= 1024 * 1024) {
      return `Dung lượng: ${(file.size / (1024 * 1024)).toFixed(2)} MB`
    }
    return `Dung lượng: ${(file.size / 1024).toFixed(1)} KB`
  }, [file, description, sizeText])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) onDropzoneClick()
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onDropzoneClick()
        }
      }}
      className={cn(
        "group border-border/80 hover:border-primary/50 hover:bg-primary/5 focus-visible:border-ring focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all focus-visible:ring-3 focus-visible:outline-none",
        disabled && "pointer-events-none opacity-60",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onFileChange}
        disabled={disabled}
      />
      <div className="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
        <Icon className="size-5" />
      </div>
      <div className="text-foreground max-w-full truncate px-4 text-sm font-semibold">
        {file ? file.name : placeholder}
      </div>
      <div className="text-muted-foreground mt-0.5 text-xs">{displaySize}</div>
    </div>
  )
}
