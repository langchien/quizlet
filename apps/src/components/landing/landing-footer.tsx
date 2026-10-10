"use client"

import * as React from "react"
import { Layers } from "lucide-react"
import { APP_NAME } from "@/types"

export function LandingFooter() {
  return (
    <footer className="border-border/40 text-muted-foreground border-t py-6 text-center text-xs">
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 sm:flex-row">
        <span>© 2026 {APP_NAME} — 日本メモ. Bản quyền thuộc về tác giả.</span>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <Layers className="size-3" /> App Router
          </span>
        </div>
      </div>
    </footer>
  )
}
