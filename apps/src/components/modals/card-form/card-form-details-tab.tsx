"use client"

import * as React from "react"
import type { UseFormRegister } from "react-hook-form"
import { UploadCloud, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import type { CreateCardBody } from "@/schemas/card"

interface CardFormDetailsTabProps {
  register: UseFormRegister<CreateCardBody>
  imagePreview: string | null
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: () => void
}

export function CardFormDetailsTab({
  register,
  imagePreview,
  onImageChange,
  onRemoveImage,
}: CardFormDetailsTabProps) {
  return (
    <TabsContent value="details" className="flex flex-col gap-4">
      {/* Ví dụ câu mẫu tiếng Nhật */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-example" className="text-xs font-semibold">
          Câu ví dụ tiếng Nhật
        </Label>
        <Input
          id="card-example"
          placeholder="VD: 毎朝りんごを食べます。"
          className="font-japanese text-sm"
          {...register("example")}
        />
      </div>

      {/* Dịch nghĩa câu ví dụ */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-example-tr" className="text-xs font-semibold">
          Dịch nghĩa câu ví dụ
        </Label>
        <Input
          id="card-example-tr"
          placeholder="VD: Mỗi sáng tôi đều ăn táo."
          {...register("exampleTranslation")}
        />
      </div>

      {/* Ghi chú bổ sung */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-note" className="text-xs font-semibold">
          Ghi chú bổ sung
        </Label>
        <Textarea
          id="card-note"
          rows={2}
          placeholder="Ghi nhớ mẹo học, liên tưởng hình ảnh..."
          {...register("note")}
        />
      </div>

      {/* Upload ảnh minh hoạ */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold">
          Hình ảnh minh hoạ (Tự động nén WebP)
        </Label>
        {imagePreview ? (
          <div className="border-border relative inline-block overflow-hidden rounded-xl border">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-32 w-auto rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
              title="Xoá ảnh"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <label className="border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 flex h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors">
            <UploadCloud className="text-muted-foreground mb-1 size-6" />
            <span className="text-foreground text-xs font-medium">
              Kéo thả hoặc nhấn để chọn ảnh
            </span>
            <span className="text-muted-foreground mt-0.5 text-[10px]">
              PNG, JPG, WebP tối đa 5MB
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </TabsContent>
  )
}
