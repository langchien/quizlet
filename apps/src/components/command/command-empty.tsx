"use client"

import * as React from "react"

interface CommandEmptyStateProps {
  query: string
}

export function CommandEmptyState({ query }: CommandEmptyStateProps) {
  return (
    <div className="text-muted-foreground py-10 text-center text-sm">
      Không tìm thấy kết quả phù hợp cho &quot;{query}&quot;
    </div>
  )
}
