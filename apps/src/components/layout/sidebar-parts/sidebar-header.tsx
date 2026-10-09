"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/types"

interface SidebarHeaderProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function SidebarHeader({
  collapsed,
  onToggleCollapse,
}: SidebarHeaderProps) {
  return (
    <div className="border-border/60 flex h-16 items-center justify-between border-b px-3">
      {!collapsed ? (
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
          <div className="from-primary flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br to-rose-600 text-base font-bold text-white shadow-sm">
            日
          </div>
          <div className="flex flex-col">
            <span className="text-foreground text-sm font-bold tracking-tight">
              {APP_NAME}
            </span>
            <span className="text-muted-foreground text-[10px] leading-none">
              日本メモ
            </span>
          </div>
        </Link>
      ) : (
        <Link href="/dashboard" className="mx-auto">
          <div className="from-primary flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br to-rose-600 text-lg font-bold text-white shadow-sm">
            日
          </div>
        </Link>
      )}

      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        className={cn(
          "text-muted-foreground hover:bg-muted hover:text-foreground hidden rounded-lg p-1.5 transition-colors md:block",
          collapsed && "mx-auto mt-2"
        )}
      >
        <ChevronLeft
          className={cn(
            "size-4 transition-transform",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </div>
  )
}
