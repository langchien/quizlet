"use client"

import * as React from "react"
import type { UseFormRegister, FieldErrors } from "react-hook-form"
import { X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import { JLPT_LEVELS } from "@/types"
import { WORD_TYPES, type TagItem } from "@/types/card-form"
import type { CreateCardBody } from "@/schemas/card"

interface CardFormBasicTabProps {
  register: UseFormRegister<CreateCardBody>
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Thuật ngữ / Từ vựng (Term) */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-term" className="text-xs font-semibold">
            Thuật ngữ / Từ vựng (Kanji / Kana){" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="card-term"
            placeholder="VD: 食べる, 勉強, 猫..."
            className="font-japanese text-base"
            {...register("term")}
          />
          {errors.term && (
            <p className="text-destructive text-xs">{errors.term.message}</p>
          )}
        </div>

        {/* Cách đọc (Reading) */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-reading" className="text-xs font-semibold">
            Cách đọc (Furigana / Hiragana / Romaji){" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="card-reading"
            placeholder="VD: たべる, べんきょう, ねこ..."
            className="font-japanese text-sm"
            {...register("reading")}
          />
          {errors.reading && (
            <p className="text-destructive text-xs">{errors.reading.message}</p>
          )}
        </div>
      </div>

      {/* Định nghĩa tiếng Việt */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-definition" className="text-xs font-semibold">
          Định nghĩa / Ý nghĩa tiếng Việt{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="card-definition"
          rows={3}
          placeholder="VD: Ăn, dùng bữa..."
          {...register("definition")}
        />
        {errors.definition && (
          <p className="text-destructive text-xs">
            {errors.definition.message}
          </p>
        )}
      </div>

      {/* Cấp độ JLPT & Loại từ */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold">Cấp độ JLPT</Label>
          <Select {...register("jlptLevel")}>
            <option value="">-- Chưa phân loại --</option>
            {JLPT_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                JLPT {lvl}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold">Loại từ</Label>
          <Select {...register("wordType")}>
            <option value="">-- Chưa chọn --</option>
            {WORD_TYPES.map((wt) => (
              <option key={wt.value} value={wt.value}>
                {wt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Bộ chọn Nhãn phân loại (Tags) */}
      <div className="flex flex-col gap-1.5">
        <Label className="flex items-center justify-between text-xs font-semibold">
          <span>Nhãn phân loại (Tags)</span>
          <span className="text-muted-foreground text-[10px] font-normal">
            Chọn hoặc gõ để tạo mới
          </span>
        </Label>

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
      </div>
    </TabsContent>
  )
}
