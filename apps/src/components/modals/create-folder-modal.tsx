"use client"

import * as React from "react"
import { useForm, Controller, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { FolderPlus, Loader2 } from "lucide-react"
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
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import {
  CreateFolderSchema,
  type CreateFolderBody,
  type FolderResponse,
} from "@/schemas/folder"
import {
  getFoldersFlatAction,
  createFolderAction,
  updateFolderAction,
} from "@/actions/folders"

export interface EditFolderData {
  id: string
  name: string
  description?: string | null
  parentId?: string | null
}

interface CreateFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (newFolder: FolderResponse) => void
  editFolder?: EditFolderData | null
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
  const [loadingFolders, setLoadingFolders] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const isEditing = !!editFolder

  const {
    register,
    control,
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

  // Load danh sách folders khi mở modal
  React.useEffect(() => {
    if (!open) return

    let isMounted = true
    setLoadingFolders(true)

    getFoldersFlatAction()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          const data = res.data
          // Lọc không hiển thị chính nó nếu đang edit
          const filtered =
            isEditing && editFolder
              ? data.filter((f) => f.id !== editFolder.id)
              : data
          setFolders(filtered)
        }
      })
      .catch((err) => console.error("Lỗi tải danh sách thư mục:", err))
      .finally(() => {
        if (isMounted) setLoadingFolders(false)
      })

    return () => {
      isMounted = false
    }
  }, [open, isEditing, editFolder])

  // Reset form khi mở modal hoặc thay đổi editFolder
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
      if (res.data) {
        onSuccess?.(res.data as FolderResponse)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const folderOptions = React.useMemo(
    () => [
      {
        value: "none",
        label: loadingFolders
          ? "Đang tải thư mục..."
          : "-- Thư mục gốc (Root Level) --",
      },
      ...folders.map((f) => ({
        value: f.id,
        label: `📁 ${f.name}`,
      })),
    ],
    [folders, loadingFolders]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
              <FolderPlus className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 pt-2"
        >
          <FieldGroup className="gap-4">
            {/* Tên thư mục */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel
                htmlFor="folder-name"
                className="text-xs font-semibold"
              >
                Tên thư mục <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="folder-name"
                disabled={submitting}
                aria-invalid={!!errors.name}
                placeholder="VD: Minna no Nihongo, Kanji N3, Somatome..."
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            {/* Mô tả */}
            <Field data-invalid={!!errors.description}>
              <FieldLabel
                htmlFor="folder-desc"
                className="text-xs font-semibold"
              >
                Mô tả thư mục (tuỳ chọn)
              </FieldLabel>
              <Textarea
                id="folder-desc"
                rows={3}
                disabled={submitting}
                aria-invalid={!!errors.description}
                placeholder="Mô tả nội dung hoặc kế hoạch học tập..."
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            {/* Thư mục cha */}
            <Field data-invalid={!!errors.parentId}>
              <FieldLabel
                htmlFor="folder-parent"
                className="text-xs font-semibold"
              >
                Thư mục cha (thư mục lồng)
              </FieldLabel>
              <Controller
                control={control}
                name="parentId"
                render={({ field }) => (
                  <Select
                    items={folderOptions}
                    value={field.value || "none"}
                    onValueChange={(val) => {
                      field.onChange(val === "none" ? null : val)
                    }}
                    disabled={submitting || loadingFolders}
                  >
                    <SelectTrigger id="folder-parent" className="w-full">
                      <SelectValue placeholder="-- Thư mục gốc (Root Level) --" />
                    </SelectTrigger>
                    <SelectContent>
                      {folderOptions.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.parentId]} />
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
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
