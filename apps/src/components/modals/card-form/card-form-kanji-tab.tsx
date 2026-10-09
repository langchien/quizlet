"use client"

import * as React from "react"
import type { UseFormRegister } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import type { CreateCardBody } from "@/schemas/card"

interface CardFormKanjiTabProps {
  register: UseFormRegister<CreateCardBody>
}

export function CardFormKanjiTab({ register }: CardFormKanjiTabProps) {
  return (
    <TabsContent value="kanji" className="flex flex-col gap-4">
      {/* Bộ thủ & Số nét */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold">Bộ thủ (Radicals)</Label>
          <Input
            placeholder="VD: ⺡ (Thuỷ), 亻 (Nhân)..."
            {...register("radicals")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold">Số nét (Stroke Count)</Label>
          <Input
            type="number"
            placeholder="VD: 8, 12..."
            {...register("strokeCount")}
          />
        </div>
      </div>

      {/* Âm On & Âm Kun */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold">Âm On (On-yomi)</Label>
          <Input
            placeholder="VD: ショク, ジキ..."
            className="font-japanese"
            {...register("onReading")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold">Âm Kun (Kun-yomi)</Label>
          <Input
            placeholder="VD: た.べる, く.らう..."
            className="font-japanese"
            {...register("kunReading")}
          />
        </div>
      </div>

      {/* Từ ghép thông dụng (Compounds) */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold">
          Từ ghép thông dụng (Compounds)
        </Label>
        <Textarea
          rows={3}
          placeholder="VD: 食事 (しょくじ - bữa ăn), 食べ物 (たべもの - đồ ăn)..."
          className="font-japanese"
          {...register("compounds")}
        />
      </div>
    </TabsContent>
  )
}
