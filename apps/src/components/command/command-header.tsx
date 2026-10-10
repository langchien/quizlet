"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"

interface CommandHeaderProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  query: string
  onQueryChange: (val: string) => void
  onClearQuery?: () => void
}

export function CommandHeader({
  inputRef,
  query,
  onQueryChange,
  onClearQuery,
}: CommandHeaderProps) {
  return (
    <div className="border-border flex items-center gap-3 border-b px-4 py-3">
      <Search className="text-muted-foreground size-5 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Tìm bộ thẻ, từ vựng (Kanji, Romaji, Hiragana), thư mục, nhãn..."
        className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm outline-hidden"
      />
      {query && (
        <button
          type="button"
          onClick={onClearQuery ?? (() => onQueryChange(""))}
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-6 shrink-0 items-center justify-center rounded-md transition-colors"
          aria-label="Xoá tìm kiếm"
        >
          <X className="size-4" />
        </button>
      )}
      <Kbd className="h-5 px-1.5 text-[10px] font-semibold">ESC</Kbd>
    </div>
  )
}
