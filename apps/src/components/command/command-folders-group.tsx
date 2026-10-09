"use client"

import * as React from "react"
import { Folder } from "lucide-react"
import type { SearchResults } from "@/types/command-palette"

interface CommandFoldersGroupProps {
  folders: SearchResults["folders"]
  onSelect: (url: string) => void
}

export function CommandFoldersGroup({
  folders,
  onSelect,
}: CommandFoldersGroupProps) {
  if (folders.length === 0) return null

  return (
    <div>
      <div className="text-muted-foreground flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
        <Folder className="size-3.5 text-blue-500" />
        <span>Thư mục ({folders.length})</span>
      </div>
      <div className="mt-1 space-y-1">
        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            onClick={() => onSelect(`/library?folderId=${folder.id}`)}
            className="hover:bg-muted group flex w-full items-center justify-between rounded-xl p-2 text-left transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="text-foreground text-xs font-semibold transition-colors group-hover:text-blue-500">
                📁 {folder.name}
              </div>
              {folder.description && (
                <div className="text-muted-foreground truncate text-[11px]">
                  {folder.description}
                </div>
              )}
            </div>
            <div className="text-muted-foreground ml-2 shrink-0 text-[11px]">
              {folder._count?.studySets ?? 0} bộ thẻ
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
