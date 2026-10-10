"use client"

import * as React from "react"
import type { TagWithCount } from "@/lib/dal/tags"
import { TagCardHeader } from "./tag-card-header"
import { TagCardFooter } from "./tag-card-footer"

interface TagCardProps {
  tag: TagWithCount
  onEdit: (tag: TagWithCount) => void
  onDelete: (tag: TagWithCount) => void
}

export function TagCard({ tag, onEdit, onDelete }: TagCardProps) {
  return (
    <div className="group border-border bg-card hover:border-border/80 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-2xs transition-all hover:shadow-md">
      <TagCardHeader tag={tag} onEdit={onEdit} onDelete={onDelete} />
      <div className="mt-4">
        <TagCardFooter tag={tag} />
      </div>
    </div>
  )
}
