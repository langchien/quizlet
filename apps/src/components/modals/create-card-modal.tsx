"use client"

import * as React from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Sparkles, UploadCloud, X, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CreateCardSchema, type CreateCardBody } from "@/schemas/card"
import { JLPT_LEVELS } from "@/types"
import type { JLPTLevel, WordType } from "@/generated/prisma/client"

interface TagItem {
  id: string
  name: string
  color: string
}

interface CreateCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studySetId: string
  onSuccess?: (newCard: unknown) => void
  editCard?: {
    id: string
    studySetId: string
    term: string
    reading: string
    definition: string
    example?: string | null
    exampleTranslation?: string | null
    imageUrl?: string | null
    audioUrl?: string | null
    note?: string | null
    jlptLevel?: string | null
    wordType?: string | null
    radicals?: string | null
    strokeCount?: number | null
    onReading?: string | null
    kunReading?: string | null
    compounds?: string | null
    tags?: TagItem[]
  } | null
}

const WORD_TYPES = [
  { value: "Noun", label: "Danh từ (Noun)" },
  { value: "Verb", label: "Động từ (Verb)" },
  { value: "IAdjective", label: "Tính từ -i (い形容詞)" },
  { value: "NaAdjective", label: "Tính từ -na (な形容詞)" },
  { value: "Adverb", label: "Phó từ (Adverb)" },
  { value: "Kanji", label: "Hán tự (Kanji)" },
  { value: "Grammar", label: "Ngữ pháp (Grammar)" },
  { value: "Other", label: "Khác (Other)" },
]

export function CreateCardModal({
  open,
  onOpenChange,
  studySetId,
  onSuccess,
  editCard,
}: CreateCardModalProps) {
  const [activeTab, setActiveTab] = React.useState("basic")
  const [submitting, setSubmitting] = React.useState(false)
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
    resolver:
      zodResolver(CreateCardSchema) as unknown as Resolver<CreateCardBody>,
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

  // Load danh sách tags
  React.useEffect(() => {
    if (open) {
      fetch("/api/tags")
        .then((res) => (res.ok ? res.json() : []))
        .then((data: TagItem[]) => setAvailableTags(data))
        .catch((err) => console.error("Error loading tags:", err))
    }
  }, [open])

  // Populate data when editing
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
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (res.ok) {
        setAvailableTags((prev) => [...prev, data])
        handleAddTag(data)
        toast.success(`Đã tạo nhãn "${name}"`)
      } else {
        toast.error(data.error || "Không thể tạo nhãn")
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

  const onSubmit = async (data: CreateCardBody) => {
    setSubmitting(true)
    try {
      const url = isEditing
        ? `/api/cards/${editCard.id}`
        : `/api/sets/${studySetId}/cards`
      const method = isEditing ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tagIds: selectedTags.map((t) => t.id),
          strokeCount:
            data.strokeCount === null || isNaN(Number(data.strokeCount))
              ? null
              : Number(data.strokeCount),
        }),
      })

      const cardJson = await res.json()

      if (!res.ok) {
        throw new Error(cardJson.error || "Thao tác thất bại")
      }

      // Nếu có file ảnh mới tải lên
      if (imageFile && cardJson.id) {
        const formData = new FormData()
        formData.append("file", imageFile)
        const imgRes = await fetch(`/api/cards/${cardJson.id}/image`, {
          method: "POST",
          body: formData,
        })
        if (imgRes.ok) {
          const imgData = await imgRes.json()
          cardJson.imageUrl = imgData.imageUrl
        }
      }

      toast.success(
        isEditing
          ? "Đã cập nhật thẻ thành công!"
          : "Đã thêm thẻ mới vào bộ thẻ!"
      )
      onOpenChange(false)
      onSuccess?.(cardJson)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onClose={() => onOpenChange(false)}>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
            {/* TAB 1: Cơ bản */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Term */}
                <div className="space-y-1.5">
                  <Label htmlFor="card-term" className="text-xs font-semibold">
                    Thuật ngữ / Từ vựng (Kanji / Kana){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="card-term"
                    placeholder="VD: 食べる, 勉強, 猫..."
                    className="font-japanese text-base"
                    {...register("term")}
                  />
                  {errors.term && (
                    <p className="text-destructive text-xs">
                      {errors.term.message}
                    </p>
                  )}
                </div>

                {/* Reading */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="card-reading"
                    className="text-xs font-semibold"
                  >
                    Cách đọc (Furigana / Hiragana / Romaji){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="card-reading"
                    placeholder="VD: たべる, べんきょう, ねこ..."
                    className="font-japanese text-sm"
                    {...register("reading")}
                  />
                  {errors.reading && (
                    <p className="text-destructive text-xs">
                      {errors.reading.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Definition */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="card-definition"
                  className="text-xs font-semibold"
                >
                  Định nghĩa / Ý nghĩa tiếng Việt{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="card-definition"
                  rows={3}
                  placeholder="VD: Ăn, dùng bữa..."
                  {...register("definition")}
                />
                {errors.definition && (
                  <p className="text-destructive text-xs">
                    {errors.definition.message}
                  </p>
                )}
              </div>

              {/* JLPT & Word Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Cấp độ JLPT</Label>
                  <Select {...register("jlptLevel")}>
                    <option value="">-- Chưa phân loại --</option>
                    {JLPT_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        JLPT {lvl}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Loại từ</Label>
                  <Select {...register("wordType")}>
                    <option value="">-- Chưa chọn --</option>
                    {WORD_TYPES.map((wt) => (
                      <option key={wt.value} value={wt.value}>
                        {wt.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Tags Selector */}
              <div className="space-y-1.5">
                <Label className="flex items-center justify-between text-xs font-semibold">
                  <span>Nhãn phân loại (Tags)</span>
                  <span className="text-muted-foreground text-[10px] font-normal">
                    Chọn hoặc gõ để tạo mới
                  </span>
                </Label>

                {/* Selected tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
                        style={{
                          borderColor: `${tag.color}40`,
                          backgroundColor: `${tag.color}15`,
                          color: tag.color,
                        }}
                      >
                        <span>{tag.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag.id)}
                          className="hover:opacity-70"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag Input and suggestions */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Gõ tên nhãn..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleCreateNewTag()
                      }
                    }}
                    className="h-8 text-xs"
                  />
                  {tagInput.trim() && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleCreateNewTag}
                    >
                      <Plus className="mr-1 size-3.5" /> Tạo nhãn
                    </Button>
                  )}
                </div>

                {/* Suggestion list */}
                {availableTags.length > 0 && (
                  <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto pt-1">
                    {availableTags
                      .filter(
                        (t) =>
                          !selectedTags.some((st) => st.id === t.id) &&
                          (!tagInput ||
                            t.name
                              .toLowerCase()
                              .includes(tagInput.toLowerCase()))
                      )
                      .slice(0, 8)
                      .map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleAddTag(t)}
                          className="border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded border px-2 py-0.5 text-[11px]"
                        >
                          + {t.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: Chi tiết & Ảnh */}
            <TabsContent value="details" className="space-y-4">
              {/* Ví dụ câu mẫu */}
              <div className="space-y-1.5">
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

              {/* Dịch câu ví dụ */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="card-example-tr"
                  className="text-xs font-semibold"
                >
                  Dịch nghĩa câu ví dụ
                </Label>
                <Input
                  id="card-example-tr"
                  placeholder="VD: Mỗi sáng tôi đều ăn táo."
                  {...register("exampleTranslation")}
                />
              </div>

              {/* Ghi chú */}
              <div className="space-y-1.5">
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

              {/* Upload ảnh */}
              <div className="space-y-1.5">
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
                      onClick={handleRemoveImage}
                      className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
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
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: Hán tự (Kanji) */}
            <TabsContent value="kanji" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Bộ thủ (Radicals)
                  </Label>
                  <Input
                    placeholder="VD: ⺡ (Thuỷ), 亻 (Nhân)..."
                    {...register("radicals")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Số nét (Stroke Count)
                  </Label>
                  <Input
                    type="number"
                    placeholder="VD: 8, 12..."
                    {...register("strokeCount")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Âm On (On-yomi)
                  </Label>
                  <Input
                    placeholder="VD: ショク, ジキ..."
                    className="font-japanese"
                    {...register("onReading")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Âm Kun (Kun-yomi)
                  </Label>
                  <Input
                    placeholder="VD: た.べる, く.らう..."
                    className="font-japanese"
                    {...register("kunReading")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
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
