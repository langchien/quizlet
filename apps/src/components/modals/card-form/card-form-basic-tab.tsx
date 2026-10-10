"use client"

import * as React from "react"
import type { UseFormRegister, FieldErrors, Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { JLPT_LEVELS } from "@/types"
import { WORD_TYPES, type TagItem } from "@/types/card-form"
import type { CreateCardBody } from "@/schemas/card"

const JLPT_OPTIONS = [
  { value: "none", label: "-- Chưa phân loại --" },
  ...JLPT_LEVELS.map((lvl) => ({ value: lvl, label: `JLPT ${lvl}` })),
]

const WORD_TYPE_OPTIONS = [
  { value: "none", label: "-- Chưa chọn --" },
  ...WORD_TYPES.map((wt) => ({ value: wt.value, label: wt.label })),
]

interface CardFormBasicTabProps {
  register: UseFormRegister<CreateCardBody>
  control: Control<CreateCardBody>
  errors: FieldErrors<CreateCardBody>
  selectedTags: TagItem[]
  availableTags: TagItem[]
  tagInput: string
  onTagInputChange: (val: string) => void
  onAddTag: (tag: TagItem) => void
  onCreateNewTag: () => void
  onRemoveTag: (tagId: string) => void
}

export function CardFormBasicTab({
  register,
  control,
  errors,
  selectedTags,
  availableTags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onCreateNewTag,
  onRemoveTag,
}: CardFormBasicTabProps) {
  return (
    <TabsContent value="basic" className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Thuật ngữ / Từ vựng (Term) */}
          <Field data-invalid={!!errors.term}>
            <FieldLabel htmlFor="card-term" className="text-xs font-semibold">
              Thuật ngữ / Từ vựng (Kanji / Kana){" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="card-term"
              placeholder="VD: 食べる, 勉強, 猫..."
              className="font-japanese text-base"
              aria-invalid={!!errors.term}
              {...register("term")}
            />
            <FieldError errors={[errors.term]} />
          </Field>

          {/* Cách đọc (Reading) */}
          <Field data-invalid={!!errors.reading}>
            <FieldLabel
              htmlFor="card-reading"
              className="text-xs font-semibold"
            >
              Cách đọc (Furigana / Hiragana / Romaji){" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="card-reading"
              placeholder="VD: たべる, べんきょう, ねこ..."
              className="font-japanese text-sm"
              aria-invalid={!!errors.reading}
              {...register("reading")}
            />
            <FieldError errors={[errors.reading]} />
          </Field>
        </div>

        {/* Định nghĩa tiếng Việt */}
        <Field data-invalid={!!errors.definition}>
          <FieldLabel
            htmlFor="card-definition"
            className="text-xs font-semibold"
          >
            Định nghĩa / Ý nghĩa tiếng Việt{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Textarea
            id="card-definition"
            rows={3}
            placeholder="VD: Ăn, dùng bữa..."
            aria-invalid={!!errors.definition}
            {...register("definition")}
          />
          <FieldError errors={[errors.definition]} />
        </Field>

        {/* Cấp độ JLPT & Loại từ */}
        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!errors.jlptLevel}>
            <FieldLabel htmlFor="card-jlpt" className="text-xs font-semibold">
              Cấp độ JLPT
            </FieldLabel>
            <Controller
              control={control}
              name="jlptLevel"
              render={({ field }) => (
                <Select
                  items={JLPT_OPTIONS}
                  value={field.value || "none"}
                  onValueChange={(val) => {
                    field.onChange(val === "none" ? null : val)
                  }}
                >
                  <SelectTrigger id="card-jlpt" className="w-full">
                    <SelectValue placeholder="-- Chưa phân loại --" />
                  </SelectTrigger>
                  <SelectContent>
                    {JLPT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.jlptLevel]} />
          </Field>

          <Field data-invalid={!!errors.wordType}>
            <FieldLabel
              htmlFor="card-word-type"
              className="text-xs font-semibold"
            >
              Loại từ
            </FieldLabel>
            <Controller
              control={control}
              name="wordType"
              render={({ field }) => (
                <Select
                  items={WORD_TYPE_OPTIONS}
                  value={field.value || "none"}
                  onValueChange={(val) => {
                    field.onChange(val === "none" ? null : val)
                  }}
                >
                  <SelectTrigger id="card-word-type" className="w-full">
                    <SelectValue placeholder="-- Chưa chọn --" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORD_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.wordType]} />
          </Field>
        </div>

        {/* Bộ chọn Nhãn phân loại (Tags) */}
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel className="text-xs font-semibold">
              Nhãn phân loại (Tags)
            </FieldLabel>
            <span className="text-muted-foreground text-[10px] font-normal">
              Chọn hoặc gõ để tạo mới
            </span>
          </div>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-1">
              {selectedTags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
                  style={{
                    borderColor: `${tag.color}40`,
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                  }}
                >
                  <span>{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag.id)}
                    className="hover:opacity-70"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag Input & tạo nhãn */}
          <div className="flex gap-2">
            <Input
              placeholder="Gõ tên nhãn..."
              value={tagInput}
              onChange={(e) => onTagInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  onCreateNewTag()
                }
              }}
              className="h-8 text-xs"
            />
            {tagInput.trim() && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={onCreateNewTag}
              >
                <Plus className="mr-1 size-3.5" /> Tạo nhãn
              </Button>
            )}
          </div>

          {/* Gợi ý nhãn có sẵn */}
          {availableTags.length > 0 && (
            <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto pt-1">
              {availableTags
                .filter(
                  (t) =>
                    !selectedTags.some((st) => st.id === t.id) &&
                    (!tagInput ||
                      t.name.toLowerCase().includes(tagInput.toLowerCase()))
                )
                .slice(0, 8)
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onAddTag(t)}
                    className="border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded border px-2 py-0.5 text-[11px]"
                  >
                    + {t.name}
                  </button>
                ))}
            </div>
          )}
        </Field>
      </FieldGroup>
    </TabsContent>
  )
}
