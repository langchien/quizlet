"use client"

import * as React from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { CreateCardSchema, type CreateCardBody } from "@/schemas/card"
import {
  createCardAction,
  updateCardAction,
  uploadCardImageAction,
} from "@/actions/cards"
import { getTagsAction, createTagAction } from "@/actions/tags"
import type { JLPTLevel, WordType } from "@/generated/prisma/client"
import type { TagItem, EditCardItem } from "@/types/card-form"

interface UseCardFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studySetId: string
  onSuccess?: (newCard: unknown) => void
  editCard?: EditCardItem | null
}

export function useCardForm({
  open,
  onOpenChange,
  studySetId,
  onSuccess,
  editCard,
}: UseCardFormProps) {
  const [activeTab, setActiveTab] = React.useState("basic")
  const [isPending, startTransition] = React.useTransition()
  const [availableTags, setAvailableTags] = React.useState<TagItem[]>([])
  const [selectedTags, setSelectedTags] = React.useState<TagItem[]>([])
  const [tagInput, setTagInput] = React.useState("")
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [imageFile, setImageFile] = React.useState<File | null>(null)

  const isEditing = !!editCard

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateCardBody>({
    resolver: zodResolver(
      CreateCardSchema
    ) as unknown as Resolver<CreateCardBody>,
    defaultValues: {
      term: "",
      reading: "",
      definition: "",
      example: "",
      exampleTranslation: "",
      imageUrl: null,
      audioUrl: null,
      note: "",
      jlptLevel: null,
      wordType: null,
      radicals: "",
      strokeCount: null,
      onReading: "",
      kunReading: "",
      compounds: "",
      tagIds: [],
    },
  })

  // Load danh sách tags khi mở modal
  React.useEffect(() => {
    if (open) {
      getTagsAction()
        .then((res) => {
          if (res.success && res.data) {
            setAvailableTags(res.data)
          }
        })
        .catch((err) => console.error("Error loading tags:", err))
    }
  }, [open])

  // Reset và nạp dữ liệu khi editCard hoặc trạng thái open thay đổi
  React.useEffect(() => {
    if (open) {
      if (editCard) {
        reset({
          term: editCard.term || "",
          reading: editCard.reading || "",
          definition: editCard.definition || "",
          example: editCard.example || "",
          exampleTranslation: editCard.exampleTranslation || "",
          imageUrl: editCard.imageUrl || null,
          audioUrl: editCard.audioUrl || null,
          note: editCard.note || "",
          jlptLevel: (editCard.jlptLevel as JLPTLevel) || null,
          wordType: (editCard.wordType as WordType) || null,
          radicals: editCard.radicals || "",
          strokeCount: editCard.strokeCount ?? null,
          onReading: editCard.onReading || "",
          kunReading: editCard.kunReading || "",
          compounds: editCard.compounds || "",
          tagIds: editCard.tags?.map((t) => t.id) || [],
        })
        setSelectedTags(editCard.tags || [])
        setImagePreview(editCard.imageUrl || null)
        setImageFile(null)
      } else {
        reset({
          term: "",
          reading: "",
          definition: "",
          example: "",
          exampleTranslation: "",
          imageUrl: null,
          audioUrl: null,
          note: "",
          jlptLevel: null,
          wordType: null,
          radicals: "",
          strokeCount: null,
          onReading: "",
          kunReading: "",
          compounds: "",
          tagIds: [],
        })
        setSelectedTags([])
        setImagePreview(null)
        setImageFile(null)
      }
      setActiveTab("basic")
    }
  }, [open, editCard, reset])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 5MB")
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setValue("imageUrl", null)
  }

  const handleAddTag = (tag: TagItem) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      const updated = [...selectedTags, tag]
      setSelectedTags(updated)
      setValue(
        "tagIds",
        updated.map((t) => t.id)
      )
    }
    setTagInput("")
  }

  const handleCreateNewTag = async () => {
    const name = tagInput.trim()
    if (!name) return

    try {
      const res = await createTagAction({ name })
      if (res.success && res.data) {
        setAvailableTags((prev) => [...prev, res.data])
        handleAddTag(res.data)
        toast.success(`Đã tạo nhãn "${name}"`)
      } else {
        toast.error(res.error || "Không thể tạo nhãn")
      }
    } catch {
      toast.error("Lỗi khi tạo nhãn mới")
    }
  }

  const handleRemoveTag = (tagId: string) => {
    const updated = selectedTags.filter((t) => t.id !== tagId)
    setSelectedTags(updated)
    setValue(
      "tagIds",
      updated.map((t) => t.id)
    )
  }

  const onSubmit = (data: CreateCardBody) => {
    startTransition(async () => {
      try {
        const payload = {
          ...data,
          studySetId,
          tagIds: selectedTags.map((t) => t.id),
          strokeCount:
            data.strokeCount === null || isNaN(Number(data.strokeCount))
              ? null
              : Number(data.strokeCount),
        }

        const res = isEditing
          ? await updateCardAction(editCard.id, payload)
          : await createCardAction(payload)

        if (!res.success) {
          toast.error(res.error || "Thao tác thất bại")
          return
        }

        let cardData = res.data

        // Nếu có file ảnh mới tải lên
        if (imageFile && cardData?.id) {
          const formData = new FormData()
          formData.append("file", imageFile)
          const imgRes = await uploadCardImageAction(cardData.id, formData)
          if (imgRes.success) {
            cardData = { ...cardData, imageUrl: imgRes.data.imageUrl }
          }
        }

        toast.success(
          isEditing
            ? "Đã cập nhật thẻ thành công!"
            : "Đã thêm thẻ mới vào bộ thẻ!"
        )
        onOpenChange(false)
        onSuccess?.(cardData)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Đã xảy ra lỗi"
        toast.error(message)
      }
    })
  }

  return {
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
    handleSubmit,
    errors,
    handleImageChange,
    handleRemoveImage,
    handleAddTag,
    handleCreateNewTag,
    handleRemoveTag,
    onSubmit,
  }
}
