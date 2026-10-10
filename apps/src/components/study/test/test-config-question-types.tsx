"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export interface TestConfigQuestionTypesProps {
  allowMultipleChoice: boolean
  onAllowMultipleChoiceChange: (val: boolean) => void
  allowTrueFalse: boolean
  onAllowTrueFalseChange: (val: boolean) => void
  allowWritten: boolean
  onAllowWrittenChange: (val: boolean) => void
}

export function TestConfigQuestionTypes({
  allowMultipleChoice,
  onAllowMultipleChoiceChange,
  allowTrueFalse,
  onAllowTrueFalseChange,
  allowWritten,
  onAllowWrittenChange,
}: TestConfigQuestionTypesProps) {
  return (
    <div className="flex flex-col gap-3">
      <Label className="text-foreground text-xs font-bold tracking-wider uppercase">
        2. Dạng câu hỏi bao gồm
      </Label>
      <div className="border-border/60 bg-muted/30 divide-border/40 divide-y rounded-2xl border p-4">
        <div className="flex items-center justify-between pb-3">
          <div className="flex flex-col gap-0.5">
            <Label
              htmlFor="type-mc"
              className="text-foreground cursor-pointer text-sm font-semibold"
            >
              Trắc nghiệm 4 lựa chọn (Multiple Choice)
            </Label>
            <p className="text-muted-foreground text-xs">
              Chọn 1 đáp án chính xác nhất trong 4 phương án.
            </p>
          </div>
          <Checkbox
            id="type-mc"
            checked={allowMultipleChoice}
            onCheckedChange={(c) => onAllowMultipleChoiceChange(c === true)}
          />
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex flex-col gap-0.5">
            <Label
              htmlFor="type-tf"
              className="text-foreground cursor-pointer text-sm font-semibold"
            >
              Đúng / Sai (True or False)
            </Label>
            <p className="text-muted-foreground text-xs">
              Xác định cặp từ vựng - ý nghĩa hiển thị là đúng hay sai.
            </p>
          </div>
          <Checkbox
            id="type-tf"
            checked={allowTrueFalse}
            onCheckedChange={(c) => onAllowTrueFalseChange(c === true)}
          />
        </div>

        <div className="flex items-center justify-between pt-3">
          <div className="flex flex-col gap-0.5">
            <Label
              htmlFor="type-written"
              className="text-foreground cursor-pointer text-sm font-semibold"
            >
              Điền từ / Tự luận (Written)
            </Label>
            <p className="text-muted-foreground text-xs">
              Xem nghĩa tiếng Việt và gõ từ tiếng Nhật (hỗ trợ cả Kanji và
              Hiragana).
            </p>
          </div>
          <Checkbox
            id="type-written"
            checked={allowWritten}
            onCheckedChange={(c) => onAllowWrittenChange(c === true)}
          />
        </div>
      </div>
    </div>
  )
}
