"use client"

import * as React from "react"
import { BookOpen } from "lucide-react"
import type { SearchResults } from "@/types/command-palette"

interface CommandSetsGroupProps {
  sets: SearchResults["sets"]
  onSelect: (url: string) => void
}

export function CommandSetsGroup({ sets, onSelect }: CommandSetsGroupProps) {
  if (sets.length === 0) return null

  return (
    <div>
      <div className="text-muted-foreground flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
        <BookOpen className="text-primary size-3.5" />
        <span>Bộ thẻ ({sets.length})</span>
      </div>
      <div className="mt-1 space-y-1">
        {sets.map((set) => (
          <button
            key={set.id}
            type="button"
            onClick={() => onSelect(`/sets/${set.id}`)}
            className="hover:bg-muted group flex w-full items-center justify-between rounded-xl p-2 text-left transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="text-foreground group-hover:text-primary flex items-center gap-2 text-xs font-semibold transition-colors">
                <span>{set.name}</span>
                {set.folder && (
                  <span className="bg-muted-foreground/10 text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">
                    📁 {set.folder.name}
                  </span>
                )}
              </div>
              {set.description && (
                <div className="text-muted-foreground truncate text-[11px]">
                  {set.description}
                </div>
              )}
            </div>
            <div className="text-muted-foreground ml-2 shrink-0 text-[11px]">
              {set.cardCount} thẻ
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
