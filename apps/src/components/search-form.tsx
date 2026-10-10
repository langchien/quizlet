"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchFormProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onOpenSearch?: () => void
}

export function SearchForm({
  className,
  onOpenSearch,
  ...props
}: SearchFormProps) {
  return (
    <button
      type="button"
      onClick={onOpenSearch}
      className={cn(
        "border-input bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground flex h-9 w-full max-w-sm cursor-pointer items-center justify-between rounded-xl border px-3 text-xs shadow-2xs transition-colors",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-2 truncate">
        <Search className="size-3.5 shrink-0" />
        <span className="hidden sm:inline">Tìm kiếm bộ thẻ, từ vựng...</span>
        <span className="sm:hidden">Tìm kiếm...</span>
      </span>
      <kbd className="border-border bg-muted text-muted-foreground pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none sm:inline-flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  )
}
