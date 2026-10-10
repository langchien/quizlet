"use client"

import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { SrsModeOption } from "@/hooks/settings/use-learning-preferences"

export interface SettingsSrsCardProps {
  srsMode: SrsModeOption
  setSrsMode: (mode: SrsModeOption) => void
  dailyGoalCards: number
  setDailyGoalCards: (cards: number) => void
  dailyTimeTarget: number
  setDailyTimeTarget: (time: number) => void
}

const SRS_MODE_OPTIONS = [
  {
    value: "auto",
    label:
      "Tự động thích ứng (Adaptive SM-2 theo tốc độ trả lời - Khuyên dùng)",
  },
  {
    value: "simple",
    label: "Đơn giản kiểu Quizlet (4 mức: Repeat / Hard / Okay / Easy)",
  },
  {
    value: "advanced",
    label: "Nâng cao SM-2 chuẩn (Thuật toán SuperMemo-2 6 cấp độ 0-5)",
  },
]

export function SettingsSrsCard({
  srsMode,
  setSrsMode,
  dailyGoalCards,
  setDailyGoalCards,
  dailyTimeTarget,
  setDailyTimeTarget,
}: SettingsSrsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Phương pháp Spaced Repetition (SRS)
        </CardTitle>
        <CardDescription>
          Cấu hình thuật toán tính toán chu kỳ lặp lại thẻ để tối ưu khả năng
          ghi nhớ dài hạn.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel htmlFor="srsMode" className="text-xs font-semibold">
              Chế độ SRS mặc định
            </FieldLabel>
            <Select
              items={SRS_MODE_OPTIONS}
              value={srsMode}
              onValueChange={(val) => val && setSrsMode(val as SrsModeOption)}
            >
              <SelectTrigger id="srsMode" className="w-full">
                <SelectValue placeholder="Chọn chế độ SRS" />
              </SelectTrigger>
              <SelectContent>
                {SRS_MODE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              {srsMode === "auto" &&
                "Hệ thống tự động đo thời gian phản hồi: trả lời đúng dưới 5s coi là Dễ, trên 15s coi là Khó."}
              {srsMode === "simple" &&
                "Bạn tự chọn mức độ nhớ thẻ: Lặp lại (0 ngày), Khó (1 ngày), Bình thường (3 ngày), Dễ (7 ngày)."}
              {srsMode === "advanced" &&
                "Thuật toán SM-2 đầy đủ tính hệ số Ease Factor và chu kỳ Interval toán học nghiêm ngặt."}
            </FieldDescription>
          </Field>

          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel
                htmlFor="dailyGoalCards"
                className="text-xs font-semibold"
              >
                Mục tiêu thẻ cần học mỗi ngày
              </FieldLabel>
              <Input
                id="dailyGoalCards"
                type="number"
                min="5"
                max="500"
                value={dailyGoalCards}
                onChange={(e) =>
                  setDailyGoalCards(Number(e.target.value) || 20)
                }
              />
              <FieldDescription className="text-[11px]">
                Số lượng thẻ học hoặc ôn tập để duy trì chuỗi Streak.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel
                htmlFor="dailyTimeTarget"
                className="text-xs font-semibold"
              >
                Mục tiêu thời gian học (phút/ngày)
              </FieldLabel>
              <Input
                id="dailyTimeTarget"
                type="number"
                min="5"
                max="180"
                value={dailyTimeTarget}
                onChange={(e) =>
                  setDailyTimeTarget(Number(e.target.value) || 15)
                }
              />
              <FieldDescription className="text-[11px]">
                Thời gian luyện tập hàng ngày hiển thị trên Dashboard.
              </FieldDescription>
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
