import { z } from "zod"

/**
 * Schema tạo tag mới
 */
export const CreateTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên nhãn không được để trống")
    .max(30, "Tên nhãn tối đa 30 ký tự"),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Mã màu Hex không hợp lệ")
    .default("#3B82F6"),
})

export type CreateTagBody = z.infer<typeof CreateTagSchema>

/**
 * Schema cập nhật tag
 */
export const UpdateTagSchema = CreateTagSchema.partial()

export type UpdateTagBody = z.infer<typeof UpdateTagSchema>

/**
 * Schema phản hồi tag
 */
export const TagResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  userId: z.string(),
  cardCount: z.number().optional().default(0),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
})

export type TagResponse = z.infer<typeof TagResponseSchema>
