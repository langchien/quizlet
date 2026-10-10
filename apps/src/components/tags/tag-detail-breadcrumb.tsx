"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"

interface TagDetailBreadcrumbProps {
  tagName: string
}

export function TagDetailBreadcrumb({ tagName }: TagDetailBreadcrumbProps) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-xs">
      <Link
        href="/tags"
        className="hover:text-foreground flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Quản lý nhãn</span>
      </Link>
      <ChevronRight className="size-3" />
      <span className="text-foreground font-semibold">{tagName}</span>
    </div>
  )
}
