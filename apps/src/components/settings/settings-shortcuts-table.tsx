"use client"

import * as React from "react"

export interface ShortcutItem {
  action: string
  key?: string
  keys?: string[]
}

const SHORTCUT_ITEMS: ShortcutItem[] = [
  { action: "Lật thẻ Flashcard / Xác nhận", key: "Space" },
  { action: "Chuyển thẻ Trước / Kế tiếp", keys: ["←", "→"] },
  { action: "Đánh giá thẻ: Chưa biết / Lặp lại", key: "1" },
  { action: "Đánh giá thẻ: Đã nhớ / Tốt", key: "2" },
  { action: "Phát âm âm thanh tiếng Nhật (TTS)", key: "A" },
  { action: "Bật / Tắt xáo trộn (Shuffle)", key: "S" },
  { action: "Lật ngược câu hỏi / trả lời (Reverse)", key: "R" },
  { action: "Tìm kiếm toàn cục", key: "Ctrl + K / ⌘ + K" },
  { action: "Mở bảng tra cứu phím tắt", key: "?" },
]

function ShortcutKbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
      {children}
    </kbd>
  )
}

export function SettingsShortcutsTable() {
  return (
    <div className="border-border/60 divide-border/40 divide-y rounded-xl border">
      <div className="bg-muted/20 flex items-center justify-between p-3 text-xs font-semibold">
        <span className="text-foreground">Thao tác</span>
        <span className="text-foreground">Phím bấm mặc định</span>
      </div>

      {SHORTCUT_ITEMS.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 text-xs"
        >
          <span className="text-muted-foreground">{item.action}</span>
          {item.keys ? (
            <div className="flex items-center gap-1">
              {item.keys.map((k) => (
                <ShortcutKbd key={k}>{k}</ShortcutKbd>
              ))}
            </div>
          ) : (
            <ShortcutKbd>{item.key}</ShortcutKbd>
          )}
        </div>
      ))}
    </div>
  )
}
