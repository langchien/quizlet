"use client"

import * as React from "react"
import { LibrarySetCard } from "./library-set-card"
import type { LibraryStudySetItem } from "@/types/library"

interface LibraryGridViewProps {
  sets: LibraryStudySetItem[]
  onEdit: (set: LibraryStudySetItem) => void
  onDuplicate: (id: string, name: string) => void
  onDelete: (set: LibraryStudySetItem) => void
}

export function LibraryGridView({
  sets,
  onEdit,
  onDuplicate,
  onDelete,
}: LibraryGridViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sets.map((set) => (
        <LibrarySetCard
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
