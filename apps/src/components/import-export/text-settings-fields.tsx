"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { TargetFolderSelect } from "./target-folder-select"
import {
  TERM_SEPARATOR_OPTIONS,
  CARD_SEPARATOR_OPTIONS,
} from "@/hooks/import-export/use-text-import"
import type { FlattenedFolder } from "@/hooks/import-export/use-folders-tree"

interface TextSettingsFieldsProps {
  setName: string
  onSetNameChange: (val: string) => void
  folderId: string
  onFolderIdChange: (val: string) => void
  folders: FlattenedFolder[]
  tags: string
  onTagsChange: (val: string) => void
  description: string
  onDescriptionChange: (val: string) => void
  termSeparator: string
  onTermSeparatorChange: (val: string) => void
  cardSeparator: string
  onCardSeparatorChange: (val: string) => void
  content: string
  onContentChange: (val: string) => void
}

export function TextSettingsFields({
  setName,
  onSetNameChange,
  folderId,
  onFolderIdChange,
  folders,
  tags,
  onTagsChange,
  description,
  onDescriptionChange,
  termSeparator,
  onTermSeparatorChange,
  cardSeparator,
  onCardSeparatorChange,
  content,
  onContentChange,
}: TextSettingsFieldsProps) {
  return (
    <FieldGroup className="gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field className="md:col-span-2">
          <FieldLabel htmlFor="text-set-name" className="text-xs font-semibold">
            Tên bộ thẻ *
          </FieldLabel>
          <Input
            id="text-set-name"
            value={setName}
            onChange={(e) => onSetNameChange(e.target.value)}
            placeholder="VD: Từ vựng sao chép từ Quizlet"
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
          <FieldLabel htmlFor="text-tags" className="text-xs font-semibold">
            Gán nhãn chung
          </FieldLabel>
          <Input
            id="text-tags"
            value={tags}
            onChange={(e) => onTagsChange(e.target.value)}
            placeholder="quizlet, n5"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="text-desc" className="text-xs font-semibold">
            Mô tả (tuỳ chọn)
          </FieldLabel>
          <Input
            id="text-desc"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Bộ thẻ nhập từ văn bản..."
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel
            htmlFor="term-sep-select"
            className="text-xs font-semibold"
          >
            Dấu phân cách giữa Từ & Nghĩa
          </FieldLabel>
          <Select
            id="term-sep-select"
            items={TERM_SEPARATOR_OPTIONS}
            value={termSeparator}
            onValueChange={(val) => val && onTermSeparatorChange(val)}
          >
            <SelectTrigger id="term-sep-select" className="w-full">
              <SelectValue placeholder="Dấu phân cách giữa Từ & Nghĩa" />
            </SelectTrigger>
            <SelectContent>
              {TERM_SEPARATOR_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="card-sep-select"
            className="text-xs font-semibold"
          >
            Dấu phân cách giữa các thẻ
          </FieldLabel>
          <Select
            id="card-sep-select"
            items={CARD_SEPARATOR_OPTIONS}
            value={cardSeparator}
            onValueChange={(val) => val && onCardSeparatorChange(val)}
          >
            <SelectTrigger id="card-sep-select" className="w-full">
              <SelectValue placeholder="Dấu phân cách giữa các thẻ" />
            </SelectTrigger>
            <SelectContent>
              {CARD_SEPARATOR_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel
            htmlFor="raw-text-content"
            className="text-xs font-semibold"
          >
            Dán danh sách từ vựng vào đây:
          </FieldLabel>
          <span className="text-muted-foreground text-[11px]">
            Hỗ trợ đọc furigana trong ngoặc: 日本語（にほんご）
          </span>
        </div>
        <Textarea
          id="raw-text-content"
          rows={8}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={`犬\tCon chó\n猫\tCon mèo\n本（ほん） - Quyển sách\n車（くるま） - Xe ô tô`}
          className="font-mono text-xs"
        />
      </Field>
    </FieldGroup>
  )
}
