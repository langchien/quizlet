"use client"

import * as React from "react"
import { Tag } from "lucide-react"
import type { SearchResults } from "@/types/command-palette"

interface CommandTagsGroupProps {
  tags: SearchResults["tags"]
  onSelect: (url: string) => void
}

export function CommandTagsGroup({ tags, onSelect }: CommandTagsGroupProps) {
  if (tags.length === 0) return null

  return (
    <div>
      <div className="text-muted-foreground flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
        <Tag className="size-3.5 text-purple-500" />
        <span>Nhãn phân loại ({tags.length})</span>
      </div>
      <div className="flex flex-wrap gap-1.5 p-1">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onSelect(`/tags/${tag.id}`)}
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80"
            style={{
              borderColor: `${tag.color}40`,
              backgroundColor: `${tag.color}15`,
              color: tag.color,
            }}
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <span>{tag.name}</span>
            <span className="text-[10px] opacity-70">({tag.cardCount})</span>
          </button>
        ))}
      </div>
    </div>
  )
}
