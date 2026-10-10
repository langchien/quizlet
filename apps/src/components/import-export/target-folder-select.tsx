"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import type { FlattenedFolder } from "@/hooks/import-export/use-folders-tree"
import { cn } from "cn"

interface TargetFolderSelectProps {
  value: string
  onChange: (value: string) => void
  folders: FlattenedFolder[]
  disabled?: boolean
  id?: string
  className?: string
}

export function TargetFolderSelect({
  value,
  onChange,
  folders,
  disabled,
  id = "target-folder-select",
  className,
}: TargetFolderSelectProps) {
  const folderOptions = React.useMemo(
    () => [
      { value: "root", label: "Thư mục gốc (Root)" },
      ...folders.map((f) => ({ value: f.id, label: `📁 ${f.name}` })),
    ],
    [folders]
  )

  return (
    <Field className={cn(className)}>
      <FieldLabel htmlFor={id} className="text-xs font-semibold">
        Lưu vào thư mục
      </FieldLabel>
      <Select
        id={id}
        items={folderOptions}
        value={value || "root"}
        onValueChange={(val) => onChange(val === "root" ? "" : (val ?? ""))}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Thư mục gốc (Root)" />
        </SelectTrigger>
        <SelectContent>
          {folderOptions.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
