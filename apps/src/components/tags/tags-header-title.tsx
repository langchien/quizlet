"use client"

import * as React from "react"
import { Tag as TagIcon } from "lucide-react"

export function TagsHeaderTitle() {
  return (
    <div>
      <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
        <TagIcon className="text-primary size-6" />
        <span>Quản lý nhãn phân loại</span>
      </h1>
      <p className="text-muted-foreground mt-1 text-xs">
        Gắn nhãn và phân nhóm các thẻ từ vựng xuyên suốt tất cả bộ thẻ.
      </p>
    </div>
  )
}
