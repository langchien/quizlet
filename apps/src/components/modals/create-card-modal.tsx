"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useCardForm } from "@/hooks/sets"
import {
  CardFormBasicTab,
  CardFormDetailsTab,
  CardFormKanjiTab,
} from "@/components/modals/card-form"
import type { EditCardItem } from "@/types/card-form"

export type { EditCardItem }

interface CreateCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studySetId: string
  onSuccess?: (newCard: unknown) => void
  editCard?: EditCardItem | null
}

export function CreateCardModal({
  open,
  onOpenChange,
  studySetId,
  onSuccess,
  editCard,
}: CreateCardModalProps) {
  const {
    activeTab,
    setActiveTab,
    isPending,
    isEditing,
    availableTags,
    selectedTags,
    tagInput,
    setTagInput,
    imagePreview,
    register,
    control,
    handleSubmit,
    errors,
    handleImageChange,
    handleRemoveImage,
    handleAddTag,
    handleCreateNewTag,
    handleRemoveTag,
    onSubmit,
  } = useCardForm({
    open,
    onOpenChange,
    studySetId,
    onSuccess,
    editCard,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Sparkles className="size-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? "Chỉnh sửa thẻ học" : "Thêm thẻ mới vào bộ thẻ"}
              </DialogTitle>
              <DialogDescription>
                Nhập từ vựng tiếng Nhật, cách đọc Furigana và định nghĩa tiếng
                Việt.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">1. Cơ bản (Bắt buộc)</TabsTrigger>
            <TabsTrigger value="details">2. Chi tiết & Ảnh</TabsTrigger>
            <TabsTrigger value="kanji">3. Hán tự (Kanji)</TabsTrigger>
          </TabsList>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 pt-3"
          >
            {/* TAB 1: Cơ bản */}
            <CardFormBasicTab
              register={register}
              control={control}
              errors={errors}
              selectedTags={selectedTags}
              availableTags={availableTags}
              tagInput={tagInput}
              onTagInputChange={setTagInput}
              onAddTag={handleAddTag}
              onCreateNewTag={handleCreateNewTag}
              onRemoveTag={handleRemoveTag}
            />

            {/* TAB 2: Chi tiết & Ảnh */}
            <CardFormDetailsTab
              register={register}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onRemoveImage={handleRemoveImage}
            />

            {/* TAB 3: Hán tự (Kanji) */}
            <CardFormKanjiTab register={register} />

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
                    ? "Lưu thay đổi"
                    : "Thêm thẻ"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
