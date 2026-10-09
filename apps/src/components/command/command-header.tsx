"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

interface CommandHeaderProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  query: string
  onQueryChange: (val: string) => void
}

export function CommandHeader({
  inputRef,
  query,
  onQueryChange,
}: CommandHeaderProps) {
  return (
    <div className="border-border flex items-center border-b px-4 py-3">
      <Search className="text-muted-foreground mr-3 size-5 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Tìm bộ thẻ, từ vựng (Kanji, Romaji, Hiragana), thư mục, nhãn..."
        className="placeholder:text-muted-foreground text-foreground w-full bg-transparent text-sm outline-hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          className="text-muted-foreground hover:bg-muted hover:text-foreground mr-2 rounded p-1"
          aria-label="Xoá tìm kiếm"
        >
          <X className="size-4" />
        </button>
      )}
      <span className="bg-muted text-muted-foreground border-border rounded border px-1.5 py-0.5 text-[10px] font-semibold">
        ESC
      </span>
    </div>
  )
}
