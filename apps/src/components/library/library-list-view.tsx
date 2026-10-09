"use client"

import * as React from "react"
import { LibrarySetRow } from "./library-set-row"
import type { LibraryStudySetItem } from "@/types/library"

interface LibraryListViewProps {
  sets: LibraryStudySetItem[]
  onEdit: (set: LibraryStudySetItem) => void
  onDuplicate: (id: string, name: string) => void
  onDelete: (set: LibraryStudySetItem) => void
}

export function LibraryListView({
  sets,
  onEdit,
  onDuplicate,
  onDelete,
}: LibraryListViewProps) {
  return (
    <div className="border-border bg-card divide-border/60 divide-y overflow-hidden rounded-2xl border">
      {sets.map((set) => (
        <LibrarySetRow
          key={set.id}
          set={set}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
