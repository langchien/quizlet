"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
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

interface SelectOption {
  value: string
  label: string
}

interface AnkiSettingsFieldsProps {
  decksCount: number
  deckOptions: SelectOption[]
  selectedDeckId: string
  onSelectDeck: (id: string) => void
  setName: string
  onSetNameChange: (val: string) => void
  folderId: string
  onFolderIdChange: (val: string) => void
  folders: FlattenedFolder[]
  tags: string
  onTagsChange: (val: string) => void
  description: string
  onDescriptionChange: (val: string) => void
}

export function AnkiSettingsFields({
  decksCount,
  deckOptions,
  selectedDeckId,
  onSelectDeck,
  setName,
  onSetNameChange,
  folderId,
  onFolderIdChange,
  folders,
  tags,
  onTagsChange,
  description,
  onDescriptionChange,
}: AnkiSettingsFieldsProps) {
  return (
    <FieldGroup className="gap-4">
      {decksCount > 1 && (
        <Field>
          <FieldLabel htmlFor="deck-select" className="text-xs font-semibold">
            Chọn Deck trong file:
          </FieldLabel>
          <Select
            id="deck-select"
            items={deckOptions}
            value={selectedDeckId}
            onValueChange={(val) => val && onSelectDeck(val)}
          >
            <SelectTrigger id="deck-select" className="w-full">
              <SelectValue placeholder="Chọn Deck..." />
            </SelectTrigger>
            <SelectContent>
              {deckOptions.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field className="md:col-span-2">
          <FieldLabel
            htmlFor="set-name-input"
            className="text-xs font-semibold"
          >
            Tên bộ thẻ mới *
          </FieldLabel>
          <Input
            id="set-name-input"
            value={setName}
            onChange={(e) => onSetNameChange(e.target.value)}
            placeholder="VD: Từ vựng Minna Bài 1"
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
          <FieldLabel
            htmlFor="set-tags-input"
            className="text-xs font-semibold"
          >
            Gán nhãn (cách nhau bởi dấu phẩy)
          </FieldLabel>
          <Input
            id="set-tags-input"
            value={tags}
            onChange={(e) => onTagsChange(e.target.value)}
            placeholder="anki, n5, bài 1"
          />
        </Field>
        <Field>
          <FieldLabel
            htmlFor="set-desc-input"
            className="text-xs font-semibold"
          >
            Mô tả (tuỳ chọn)
          </FieldLabel>
          <Input
            id="set-desc-input"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Bộ thẻ nhập từ Anki..."
          />
        </Field>
      </div>
    </FieldGroup>
  )
}
