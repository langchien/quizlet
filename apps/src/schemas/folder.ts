import { z } from "zod"

/**
 * Schema tạo thư mục mới
 */
export const CreateFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên thư mục không được để trống")
    .max(80, "Tên thư mục quá dài"),
  description: z
    .string()
    .trim()
    .max(300, "Mô tả tối đa 300 ký tự")
    .optional()
    .nullable(),
  parentId: z.string().optional().nullable(),
  order: z.number().int().default(0),
})

export type CreateFolderBody = z.infer<typeof CreateFolderSchema>

/**
 * Schema cập nhật thư mục
 */
export const UpdateFolderSchema = CreateFolderSchema.partial()

export type UpdateFolderBody = z.infer<typeof UpdateFolderSchema>

/**
 * Schema di chuyển thư mục
 */
export const MoveFolderSchema = z.object({
  parentId: z.string().nullable(),
})

export type MoveFolderBody = z.infer<typeof MoveFolderSchema>

export interface FolderResponse {
  id: string
  name: string
  description?: string | null
  parentId?: string | null
  userId: string
  order: number
  createdAt: Date | string
  updatedAt: Date | string
  children?: FolderResponse[]
  studySets?: Array<{
    id: string
    name: string
    cardCount: number
  }>
}

/**
 * Schema hiển thị thư mục cơ bản (hỗ trợ lồng nhau)
 */
export const FolderResponseSchema: z.ZodType<FolderResponse> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    parentId: z.string().nullable().optional(),
    userId: z.string(),
    order: z.number(),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
    children: z.array(FolderResponseSchema).optional(),
    studySets: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          cardCount: z.number(),
        })
      )
      .optional(),
  })
)
