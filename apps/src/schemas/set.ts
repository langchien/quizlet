import { z } from "zod"
import { CardResponseSchema } from "./card"

/**
 * Schema tạo bộ thẻ mới
 */
export const CreateSetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên bộ thẻ không được để trống")
    .max(100, "Tên quá dài"),
  description: z
    .string()
    .trim()
    .max(500, "Mô tả tối đa 500 ký tự")
    .optional()
    .nullable(),
  sourceLanguage: z.string().default("ja"),
  targetLanguage: z.string().default("vi"),
  folderId: z.string().optional().nullable(),
})

export type CreateSetBody = z.infer<typeof CreateSetSchema>

/**
 * Schema cập nhật bộ thẻ
 */
export const UpdateSetSchema = CreateSetSchema.partial()

export type UpdateSetBody = z.infer<typeof UpdateSetSchema>

/**
 * Schema nhân bản bộ thẻ
 */
export const DuplicateSetSchema = z.object({
  name: z.string().trim().min(1).optional(),
})

export type DuplicateSetBody = z.infer<typeof DuplicateSetSchema>

/**
 * Schema gộp nhiều bộ thẻ
 */
export const MergeSetsSchema = z.object({
  targetSetId: z.string().min(1, "Vui lòng chọn bộ thẻ đích"),
  sourceSetIds: z
    .array(z.string())
    .min(1, "Chọn ít nhất một bộ thẻ nguồn cần gộp"),
  deleteSources: z.boolean().default(false),
})

export type MergeSetsBody = z.infer<typeof MergeSetsSchema>

/**
 * Schema chi tiết bộ thẻ trả về
 */
export const SetResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  folderId: z.string().nullable().optional(),
  userId: z.string(),
  cardCount: z.number(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
  cards: z.array(CardResponseSchema).optional(),
  folder: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  progress: z
    .object({
      mastered: z.number(),
      learning: z.number(),
      new: z.number(),
      percentage: z.number(),
    })
    .optional(),
})

export type SetResponse = z.infer<typeof SetResponseSchema>

/**
 * Schema danh sách bộ thẻ kèm phân trang
 */
export const SetListResponseSchema = z.object({
  items: z.array(SetResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export type SetListResponse = z.infer<typeof SetListResponseSchema>
