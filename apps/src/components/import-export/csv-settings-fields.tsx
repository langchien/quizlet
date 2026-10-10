"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { TargetFolderSelect } from "./target-folder-select"
import type { FlattenedFolder } from "@/hooks/import-export/use-folders-tree"

const DELIMITER_OPTIONS = [
  { value: ",", label: "Dấu phẩy ( , )" },
  { value: "\t", label: "Dấu Tab ( \\t )" },
  { value: ";", label: "Dấu chấm phẩy ( ; )" },
  { value: "|", label: "Dấu gạch đứng ( | )" },
]

interface CsvSettingsFieldsProps {
  setName: string
  onSetNameChange: (val: string) => void
  folderId: string
  onFolderIdChange: (val: string) => void
  folders: FlattenedFolder[]
  tags: string
  onTagsChange: (val: string) => void
  description: string
  onDescriptionChange: (val: string) => void
  delimiter: string
  onDelimiterChange: (val: string) => void
  hasHeader: boolean
  onHasHeaderChange: (val: boolean) => void
}

export function CsvSettingsFields({
  setName,
  onSetNameChange,
  folderId,
  onFolderIdChange,
  folders,
  tags,
  onTagsChange,
  description,
  onDescriptionChange,
  delimiter,
  onDelimiterChange,
  hasHeader,
  onHasHeaderChange,
}: CsvSettingsFieldsProps) {
  return (
    <FieldGroup className="gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field className="md:col-span-2">
          <FieldLabel htmlFor="csv-set-name" className="text-xs font-semibold">
            Tên bộ thẻ *
          </FieldLabel>
          <Input
            id="csv-set-name"
            value={setName}
            onChange={(e) => onSetNameChange(e.target.value)}
            placeholder="VD: Từ vựng N4 CSV"
          />
        </Field>
        <TargetFolderSelect
          value={folderId}
          onChange={onFolderIdChange}
          folders={folders}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="csv-tags" className="text-xs font-semibold">
            Gán nhãn chung
          </FieldLabel>
          <Input
            id="csv-tags"
            value={tags}
            onChange={(e) => onTagsChange(e.target.value)}
            placeholder="n4, từ vựng"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="csv-desc" className="text-xs font-semibold">
            Mô tả (tuỳ chọn)
          </FieldLabel>
          <Input
            id="csv-desc"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Bộ thẻ tạo từ CSV..."
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end">
        <Field>
          <FieldLabel htmlFor="csv-delimiter" className="text-xs font-semibold">
            Dấu phân cách (Delimiter)
          </FieldLabel>
          <Select
            id="csv-delimiter"
            items={DELIMITER_OPTIONS}
            value={delimiter}
            onValueChange={(val) => val && onDelimiterChange(val)}
          >
            <SelectTrigger id="csv-delimiter" className="w-full">
              <SelectValue placeholder="Chọn dấu phân cách" />
            </SelectTrigger>
            <SelectContent>
              {DELIMITER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex items-center gap-2 pb-2">
          <Checkbox
            id="csv-header-check"
            checked={hasHeader}
            onCheckedChange={(checked) => onHasHeaderChange(!!checked)}
          />
          <FieldLabel
            htmlFor="csv-header-check"
            className="cursor-pointer text-xs font-medium select-none"
          >
            Dòng đầu tiên là tiêu đề (Header)
          </FieldLabel>
        </div>
      </div>
    </FieldGroup>
  )
}
