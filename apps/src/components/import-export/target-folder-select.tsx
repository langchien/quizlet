"use client"

import * as React from "react"
import { NativeSelect as Select } from "@/components/ui/native-select"
import type { FlattenedFolder } from "@/hooks/import-export/use-folders-tree"

interface TargetFolderSelectProps {
  value: string
  onChange: (value: string) => void
  folders: FlattenedFolder[]
  disabled?: boolean
  id?: string
}

export function TargetFolderSelect({
  value,
  onChange,
  folders,
  disabled,
  id,
}: TargetFolderSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold">
        Lưu vào thư mục
      </label>
      <Select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full"
      >
        <option value="">Thư mục gốc (Root)</option>
        {folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </Select>
    </div>
  )
}
