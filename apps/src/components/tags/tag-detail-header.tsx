"use client"

import * as React from "react"
import { Tag as TagIcon } from "lucide-react"

interface TagDetailHeaderProps {
  tag: {
    id: string
    name: string
    color: string
  }
  cardCount: number
}

export function TagDetailHeader({ tag, cardCount }: TagDetailHeaderProps) {
  return (
    <div
      className="rounded-3xl border p-6 sm:p-8"
      style={{
        borderColor: `${tag.color}40`,
        backgroundColor: `${tag.color}10`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex size-12 items-center justify-center rounded-2xl text-white shadow-xs"
          style={{ backgroundColor: tag.color }}
        >
          <TagIcon className="size-6" />
        </div>
        <div>
          <h1 className="text-foreground text-2xl font-extrabold sm:text-3xl">
            {tag.name}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Đang gắn trên <strong>{cardCount}</strong> thẻ từ vựng xuyên suốt
            các bộ thẻ
          </p>
        </div>
      </div>
    </div>
  )
}
