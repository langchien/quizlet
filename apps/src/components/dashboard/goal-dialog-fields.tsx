"use client"

import * as React from "react"
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export interface GoalDialogFieldsProps {
  cardTarget: number
  onCardTargetChange: (value: number) => void
  timeTarget: number
  onTimeTargetChange: (value: number) => void
}

export function GoalDialogFields({
  cardTarget,
  onCardTargetChange,
  timeTarget,
  onTimeTargetChange,
}: GoalDialogFieldsProps) {
  return (
    <FieldGroup className="py-3">
      <Field>
        <FieldLabel htmlFor="cardTarget" className="text-xs font-semibold">
          Mục tiêu số thẻ mỗi ngày (1 - 500 thẻ)
        </FieldLabel>
        <Input
          id="cardTarget"
          type="number"
          min={1}
          max={500}
          value={cardTarget}
          onChange={(e) => onCardTargetChange(Number(e.target.value))}
          className="rounded-xl"
        />
        <FieldDescription className="text-[11px]">
          Gợi ý: 20 thẻ/ngày là mức lý tưởng để duy trì phản xạ tiếng Nhật.
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="timeTarget" className="text-xs font-semibold">
          Mục tiêu thời gian mỗi ngày (1 - 720 phút)
        </FieldLabel>
        <Input
          id="timeTarget"
          type="number"
          min={1}
          max={720}
          value={timeTarget}
          onChange={(e) => onTimeTargetChange(Number(e.target.value))}
          className="rounded-xl"
        />
        <FieldDescription className="text-[11px]">
          Gợi ý: 15-30 phút/ngày giúp hình thành thói quen lâu dài.
        </FieldDescription>
      </Field>
    </FieldGroup>
  )
}
