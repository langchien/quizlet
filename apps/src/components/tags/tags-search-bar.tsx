"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface TagsSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function TagsSearchBar({ value, onChange }: TagsSearchBarProps) {
  return (
    <div className="border-border bg-card/60 flex items-center rounded-2xl border p-3 shadow-2xs">
      <div className="relative max-w-md flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Tìm theo tên nhãn..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 pl-9 text-xs"
        />
      </div>
    </div>
  )
}
