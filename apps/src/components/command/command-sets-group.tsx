"use client"

import * as React from "react"
import { BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { SearchResults } from "@/types/command-palette"

interface CommandSetItemProps {
  set: SearchResults["sets"][number]
  onSelect: (url: string) => void
}

function CommandSetItem({ set, onSelect }: CommandSetItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(`/sets/${set.id}`)}
      className="group hover:bg-muted flex w-full items-center justify-between rounded-xl p-2 text-left transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="text-foreground group-hover:text-primary flex items-center gap-2 text-xs font-semibold transition-colors">
          <span className="truncate">{set.name}</span>
          {set.folder && (
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-[10px] font-normal"
            >
              📁 {set.folder.name}
            </Badge>
          )}
        </div>
        {set.description && (
          <p className="text-muted-foreground truncate text-[11px]">
            {set.description}
          </p>
        )}
      </div>
      <span className="text-muted-foreground ml-2 shrink-0 text-[11px]">
        {set.cardCount} thẻ
      </span>
    </button>
  )
}

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
      <div className="mt-1 flex flex-col gap-1">
        {sets.map((set) => (
          <CommandSetItem key={set.id} set={set} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
