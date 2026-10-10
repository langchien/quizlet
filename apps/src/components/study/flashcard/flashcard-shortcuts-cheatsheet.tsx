"use client"

import * as React from "react"

const SHORTCUT_HINTS = [
  { key: "Space", label: "Lật thẻ" },
  { key: "← / →", label: "Chuyển thẻ" },
  { key: "1", label: "Chưa biết" },
  { key: "2", label: "Đã biết" },
  { key: "A", label: "Phát âm" },
]

export function FlashcardShortcutsCheatsheet() {
  return (
    <div className="border-border/40 text-muted-foreground mx-auto flex w-full max-w-2xl flex-wrap items-center justify-center gap-4 border-t pt-4 text-[11px]">
      {SHORTCUT_HINTS.map((h) => (
        <span key={h.key}>
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            {h.key}
          </kbd>{" "}
          {h.label}
        </span>
      ))}
    </div>
  )
}
