import { z } from "zod"
import { JLPT_LEVELS, WORD_TYPES } from "@/types"

export const JLPTLevelEnum = z.enum(JLPT_LEVELS)
export const WordTypeEnum = z.enum(WORD_TYPES)

/**
 * Schema tạo thẻ mới
 */
export const CreateCardSchema = z.object({
  studySetId: z.string().min(1, "Vui lòng chọn bộ thẻ"),
  term: z.string().trim().min(1, "Thuật ngữ không được để trống"),
  reading: z
    .string()
    .trim()
    .min(1, "Cách đọc (Furigana/Hiragana) không được để trống"),
  definition: z.string().trim().min(1, "Ý nghĩa không được để trống"),
  example: z.string().trim().optional().nullable(),
  exampleTranslation: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  audioUrl: z.string().trim().optional().nullable(),
  note: z.string().trim().optional().nullable(),
  jlptLevel: JLPTLevelEnum.optional().nullable(),
  wordType: WordTypeEnum.optional().nullable(),
  radicals: z.string().trim().optional().nullable(),
  strokeCount: z.number().int().positive().optional().nullable(),
  onReading: z.string().trim().optional().nullable(),
  kunReading: z.string().trim().optional().nullable(),
  compounds: z.string().trim().optional().nullable(),
  order: z.number().int().default(0),
  tagIds: z.array(z.string()).optional().default([]),
})

export type CreateCardBody = z.infer<typeof CreateCardSchema>

/**
 * Schema cập nhật thẻ
 */
export const UpdateCardSchema = CreateCardSchema.partial().omit({
  studySetId: true,
})

export type UpdateCardBody = z.infer<typeof UpdateCardSchema>

/**
 * Schema sắp xếp thứ tự các thẻ
 */
export const ReorderCardsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number().int(),
    })
  ),
})

export type ReorderCardsBody = z.infer<typeof ReorderCardsSchema>

/**
 * Schema gán tag hàng loạt cho các thẻ
 */
export const BulkTagCardsSchema = z.object({
  cardIds: z.array(z.string()).min(1, "Chọn ít nhất một thẻ"),
  tagIds: z.array(z.string()).min(1, "Chọn ít nhất một nhãn"),
  action: z.enum(["add", "remove"]).default("add"),
})

export type BulkTagCardsBody = z.infer<typeof BulkTagCardsSchema>

/**
 * Schema chi tiết thẻ trả về từ API
 */
export const CardResponseSchema = z.object({
  id: z.string(),
  studySetId: z.string(),
  term: z.string(),
  reading: z.string(),
  definition: z.string(),
  example: z.string().nullable().optional(),
  exampleTranslation: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  jlptLevel: JLPTLevelEnum.nullable().optional(),
  wordType: WordTypeEnum.nullable().optional(),
  radicals: z.string().nullable().optional(),
  strokeCount: z.number().nullable().optional(),
  onReading: z.string().nullable().optional(),
  kunReading: z.string().nullable().optional(),
  compounds: z.string().nullable().optional(),
  order: z.number(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
      })
    )
    .optional(),
  srsData: z.record(z.string(), z.unknown()).nullable().optional(),
})

export type CardResponse = z.infer<typeof CardResponseSchema>
