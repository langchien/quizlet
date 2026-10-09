"use client"

import * as React from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { BookOpen } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CreateSetSchema, type CreateSetBody } from "@/schemas/set"
import { createSetAction, updateSetAction } from "@/actions/sets"
import { getFoldersFlatAction } from "@/actions/folders"

interface CreateSetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (newSet: unknown) => void
  editSet?: {
    id: string
    name: string
    description?: string | null
    sourceLanguage?: string
    targetLanguage?: string
    folderId?: string | null
  } | null
  defaultFolderId?: string | null
}

export function CreateSetModal({
  open,
  onOpenChange,
  onSuccess,
  editSet,
  defaultFolderId,
}: CreateSetModalProps) {
  const [folders, setFolders] = React.useState<
    Array<{ id: string; name: string }>
  >([])
  const [isPending, startTransition] = React.useTransition()

  const isEditing = !!editSet

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSetBody>({
    resolver: zodResolver(
      CreateSetSchema
    ) as unknown as Resolver<CreateSetBody>,
    defaultValues: {
      name: "",
      description: "",
      sourceLanguage: "ja",
      targetLanguage: "vi",
      folderId: defaultFolderId || null,
    },
  })

  // Load danh sách folders phẳng để hiển thị trong select
  React.useEffect(() => {
    if (open) {
      getFoldersFlatAction()
        .then((res) => {
          if (res.success && res.data) {
            setFolders(res.data)
          }
        })
        .catch((err) => console.error("Error fetching folders:", err))
    }
  }, [open])

  // Fill form khi sửa hoặc mở
  React.useEffect(() => {
    if (open) {
      if (editSet) {
        reset({
          name: editSet.name,
          description: editSet.description || "",
          sourceLanguage: editSet.sourceLanguage || "ja",
          targetLanguage: editSet.targetLanguage || "vi",
          folderId: editSet.folderId || null,
        })
      } else {
        reset({
          name: "",
          description: "",
          sourceLanguage: "ja",
          targetLanguage: "vi",
          folderId: defaultFolderId || null,
        })
      }
    }
  }, [open, editSet, defaultFolderId, reset])

  const onSubmit = (data: CreateSetBody) => {
    startTransition(async () => {
      try {
        const payload = {
          ...data,
          folderId:
            data.folderId === "none" || !data.folderId ? null : data.folderId,
        }

        const res = isEditing
          ? await updateSetAction(editSet.id, payload)
          : await createSetAction(payload)

        if (!res.success) {
          toast.error(res.error || "Thao tác thất bại")
          return
        }

        toast.success(
          isEditing
            ? "Đã cập nhật bộ thẻ thành công!"
            : "Đã tạo bộ thẻ mới thành công!"
        )
        onOpenChange(false)
        onSuccess?.(res.data)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Đã xảy ra lỗi"
        toast.error(message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
              <BookOpen className="size-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? "Chỉnh sửa bộ thẻ" : "Tạo bộ thẻ mới"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Cập nhật thông tin chi tiết cho bộ thẻ học tập."
                  : "Tạo một bộ thẻ mới để bắt đầu thêm từ vựng, ngữ pháp hoặc Kanji."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Tên bộ thẻ */}
          <div className="space-y-1.5">
            <Label htmlFor="set-name" className="text-xs font-semibold">
              Tên bộ thẻ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="set-name"
              placeholder="VD: Từ vựng Minna no Nihongo Bài 1..."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <Label htmlFor="set-desc" className="text-xs font-semibold">
              Mô tả (tuỳ chọn)
            </Label>
            <Textarea
              id="set-desc"
              rows={3}
              placeholder="Mô tả nội dung, mục tiêu bài học hoặc ghi chú..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-destructive text-xs">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Chọn thư mục */}
          <div className="space-y-1.5">
            <Label htmlFor="set-folder" className="text-xs font-semibold">
              Thư mục chứa
            </Label>
            <Select id="set-folder" {...register("folderId")}>
              <option value="none">-- Không thuộc thư mục nào (Gốc) --</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Ngôn ngữ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ngôn ngữ nguồn</Label>
              <Select {...register("sourceLanguage")}>
                <option value="ja">Tiếng Nhật (日本語)</option>
                <option value="en">Tiếng Anh (English)</option>
                <option value="vi">Tiếng Việt</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ngôn ngữ đích</Label>
              <Select {...register("targetLanguage")}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">Tiếng Anh (English)</option>
                <option value="ja">Tiếng Nhật (日本語)</option>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Đang lưu..."
                : isEditing
                  ? "Cập nhật bộ thẻ"
                  : "Tạo bộ thẻ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
