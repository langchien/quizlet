"use client"

import * as React from "react"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Tag as TagIcon, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateTagSchema, type CreateTagBody } from "@/schemas/tag"

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#64748B", // Slate
  "#84CC16", // Lime
]

interface CreateTagModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (newTag: unknown) => void
  editTag?: {
    id: string
    name: string
    color: string
  } | null
}

export function CreateTagModal({
  open,
  onOpenChange,
  onSuccess,
  editTag,
}: CreateTagModalProps) {
  const [submitting, setSubmitting] = React.useState(false)
  const isEditing = !!editTag

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateTagBody>({
    resolver:
      zodResolver(CreateTagSchema) as unknown as Resolver<CreateTagBody>,
    defaultValues: {
      name: "",
      color: "#3B82F6",
    },
  })

  const selectedColor = useWatch({ control, name: "color" }) || "#3B82F6"

  React.useEffect(() => {
    if (open) {
      if (editTag) {
        reset({
          name: editTag.name,
          color: editTag.color || "#3B82F6",
        })
      } else {
        reset({
          name: "",
          color: "#3B82F6",
        })
      }
    }
  }, [open, editTag, reset])

  const onSubmit = async (data: CreateTagBody) => {
    setSubmitting(true)
    try {
      const url = isEditing ? `/api/tags/${editTag.id}` : "/api/tags"
      const method = isEditing ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || "Thao tác thất bại")
      }

      toast.success(
        isEditing
          ? "Đã cập nhật nhãn thành công!"
          : "Đã tạo nhãn mới thành công!"
      )
      onOpenChange(false)
      onSuccess?.(json)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className="flex size-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${selectedColor}20`,
                color: selectedColor,
              }}
            >
              <TagIcon className="size-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? "Chỉnh sửa nhãn" : "Tạo nhãn mới"}
              </DialogTitle>
              <DialogDescription>
                Phân loại thẻ học linh hoạt qua nhiều chủ đề khác nhau.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Tên nhãn */}
          <div className="space-y-1.5">
            <Label htmlFor="tag-name" className="text-xs font-semibold">
              Tên nhãn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tag-name"
              placeholder="VD: Động từ nhóm 1, N3 Kanji, Hay nhầm..."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* Bảng màu */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Màu sắc đại diện</Label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className="group border-border/60 relative flex h-9 w-full items-center justify-center rounded-xl border transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: color }}
                >
                  {selectedColor?.toLowerCase() === color.toLowerCase() && (
                    <Check className="size-4 text-white drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Đang lưu..."
                : isEditing
                  ? "Cập nhật nhãn"
                  : "Tạo nhãn"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
