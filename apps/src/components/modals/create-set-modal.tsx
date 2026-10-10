"use client"

import { getFoldersFlatAction } from "@/actions/folders"
import { createSetAction, updateSetAction } from "@/actions/sets"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  CreateSetSchema,
  type CreateSetBody,
  type SetResponse,
} from "@/schemas/set"
import { zodResolver } from "@hookform/resolvers/zod"
import { BookOpen, Loader2 } from "lucide-react"
import * as React from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"

const LANGUAGE_OPTIONS = [
  { value: "ja", label: "Tiếng Nhật (日本語)" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "Tiếng Anh (English)" },
]

export interface EditSetData {
  id: string
  name: string
  description?: string | null
  sourceLanguage?: string
  targetLanguage?: string
  folderId?: string | null
}

interface CreateSetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (newSet: SetResponse) => void
  editSet?: EditSetData | null
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
  const [loadingFolders, setLoadingFolders] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  const isEditing = !!editSet

  const {
    register,
    control,
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

  // Load danh sách folders khi mở modal
  React.useEffect(() => {
    if (!open) return

    let isMounted = true
    setLoadingFolders(true)

    getFoldersFlatAction()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setFolders(res.data)
        }
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách thư mục:", err)
      })
      .finally(() => {
        if (isMounted) setLoadingFolders(false)
      })

    return () => {
      isMounted = false
    }
  }, [open])

  // Đồng bộ giá trị vào form khi mở modal hoặc thay đổi editSet
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
        if (res.data) {
          onSuccess?.(res.data as SetResponse)
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Đã xảy ra lỗi"
        toast.error(message)
      }
    })
  }

  // Danh sách options thư mục
  const folderOptions = React.useMemo(
    () => [
      {
        value: "none",
        label: loadingFolders
          ? "Đang tải thư mục..."
          : "-- Không thuộc thư mục nào (Gốc) --",
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
      <DialogContent size="lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
              <BookOpen className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 pt-2"
        >
          <FieldGroup className="gap-4">
            {/* Tên bộ thẻ */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="set-name">
                Tên bộ thẻ <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="set-name"
                disabled={isPending}
                aria-invalid={!!errors.name}
                placeholder="VD: Từ vựng Minna no Nihongo Bài 1..."
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            {/* Mô tả */}
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="set-desc">Mô tả (tuỳ chọn)</FieldLabel>
              <Textarea
                id="set-desc"
                rows={3}
                disabled={isPending}
                aria-invalid={!!errors.description}
                placeholder="Mô tả nội dung, mục tiêu bài học hoặc ghi chú..."
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            {/* Chọn thư mục */}
            <Field data-invalid={!!errors.folderId}>
              <FieldLabel htmlFor="set-folder">Thư mục chứa</FieldLabel>
              <Controller
                control={control}
                name="folderId"
                render={({ field }) => (
                  <Select
                    items={folderOptions}
                    value={field.value || "none"}
                    onValueChange={(val) => {
                      field.onChange(val === "none" ? null : val)
                    }}
                    disabled={isPending || loadingFolders}
                  >
                    <SelectTrigger id="set-folder" className="w-full">
                      <SelectValue placeholder="-- Không thuộc thư mục nào (Gốc) --" />
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
              <FieldError errors={[errors.folderId]} />
            </Field>

            {/* Ngôn ngữ */}
            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.sourceLanguage}>
                <FieldLabel htmlFor="source-lang">Ngôn ngữ nguồn</FieldLabel>
                <Controller
                  control={control}
                  name="sourceLanguage"
                  render={({ field }) => (
                    <Select
                      items={LANGUAGE_OPTIONS}
                      value={field.value || "ja"}
                      onValueChange={(val) => {
                        if (val) field.onChange(val)
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger id="source-lang" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.sourceLanguage]} />
              </Field>

              <Field data-invalid={!!errors.targetLanguage}>
                <FieldLabel htmlFor="target-lang">Ngôn ngữ đích</FieldLabel>
                <Controller
                  control={control}
                  name="targetLanguage"
                  render={({ field }) => (
                    <Select
                      items={LANGUAGE_OPTIONS}
                      value={field.value || "vi"}
                      onValueChange={(val) => {
                        if (val) field.onChange(val)
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger id="target-lang" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.targetLanguage]} />
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
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
