"use client"

import * as React from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { FolderPlus } from "lucide-react"
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
import { CreateFolderSchema, type CreateFolderBody } from "@/schemas/folder"
import {
  getFoldersFlatAction,
  createFolderAction,
  updateFolderAction,
} from "@/actions/folders"

interface CreateFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (newFolder: unknown) => void
  editFolder?: {
    id: string
    name: string
    description?: string | null
    parentId?: string | null
  } | null
  defaultParentId?: string | null
}

export function CreateFolderModal({
  open,
  onOpenChange,
  onSuccess,
  editFolder,
  defaultParentId,
}: CreateFolderModalProps) {
  const [folders, setFolders] = React.useState<
    Array<{ id: string; name: string }>
  >([])
  const [submitting, setSubmitting] = React.useState(false)

  const isEditing = !!editFolder

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFolderBody>({
    resolver: zodResolver(
      CreateFolderSchema
    ) as unknown as Resolver<CreateFolderBody>,
    defaultValues: {
      name: "",
      description: "",
      parentId: defaultParentId || null,
      order: 0,
    },
  })

  // Load danh sách folders để chọn parent
  React.useEffect(() => {
    if (open) {
      getFoldersFlatAction()
        .then((res) => {
          if (res.success && res.data) {
            const data = res.data
            // Lọc không hiển thị chính nó nếu đang edit
            const filtered = isEditing
              ? data.filter((f) => f.id !== editFolder?.id)
              : data
            setFolders(filtered)
          }
        })
        .catch((err) => console.error("Error fetching folders:", err))
    }
  }, [open, isEditing, editFolder])

  React.useEffect(() => {
    if (open) {
      if (editFolder) {
        reset({
          name: editFolder.name,
          description: editFolder.description || "",
          parentId: editFolder.parentId || null,
          order: 0,
        })
      } else {
        reset({
          name: "",
          description: "",
          parentId: defaultParentId || null,
          order: 0,
        })
      }
    }
  }, [open, editFolder, defaultParentId, reset])

  const onSubmit = async (data: CreateFolderBody) => {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        parentId:
          data.parentId === "none" || !data.parentId ? null : data.parentId,
      }

      const res =
        isEditing && editFolder
          ? await updateFolderAction(editFolder.id, payload)
          : await createFolderAction(payload)

      if (!res.success) {
        throw new Error(res.error || "Thao tác thất bại")
      }

      toast.success(
        isEditing
          ? "Đã cập nhật thư mục thành công!"
          : "Đã tạo thư mục mới thành công!"
      )
      onOpenChange(false)
      onSuccess?.(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <FolderPlus className="size-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? "Chỉnh sửa thư mục" : "Tạo thư mục mới"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Cập nhật thông tin và vị trí của thư mục."
                  : "Tổ chức các bộ thẻ theo chuyên đề, giáo trình hoặc cấp độ."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Tên thư mục */}
          <div className="space-y-1.5">
            <Label htmlFor="folder-name" className="text-xs font-semibold">
              Tên thư mục <span className="text-destructive">*</span>
            </Label>
            <Input
              id="folder-name"
              placeholder="VD: Minna no Nihongo, Kanji N3, Somatome..."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <Label htmlFor="folder-desc" className="text-xs font-semibold">
              Mô tả thư mục
            </Label>
            <Textarea
              id="folder-desc"
              rows={3}
              placeholder="Mô tả nội dung hoặc kế hoạch học tập..."
              {...register("description")}
            />
          </div>

          {/* Thư mục cha */}
          <div className="space-y-1.5">
            <Label htmlFor="folder-parent" className="text-xs font-semibold">
              Thư mục cha (thư mục lồng)
            </Label>
            <Select id="folder-parent" {...register("parentId")}>
              <option value="none">-- Thư mục gốc (Root Level) --</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </Select>
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
                  ? "Cập nhật thư mục"
                  : "Tạo thư mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
