"use client"

import * as React from "react"
import Link from "next/link"
import type { TagWithCount } from "@/lib/dal/tags"

interface TagCardFooterProps {
  tag: TagWithCount
}

export function TagCardFooter({ tag }: TagCardFooterProps) {
  return (
    <div className="border-border/40 flex items-center justify-between border-t pt-3">
      <span className="text-muted-foreground text-xs font-medium">
        {tag.cardCount} thẻ liên kết
      </span>

      <Link
        href={`/tags/${tag.id}`}
        className="text-primary hover:text-primary/80 text-xs font-medium transition-colors hover:underline"
      >
        Xem thẻ &rarr;
      </Link>
    </div>
  )
}
