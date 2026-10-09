import { z } from "zod"

/**
 * Re-export Enums schema
 */
export * from "./enums"

/**
 * Schema thông tin người dùng cơ bản
 */
export const UserBaseSchema = z.object({
  id: z.string(),
  email: z.string().email("Email không hợp lệ"),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  avatar: z.string().url().nullable().optional(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
})

export type UserBaseDTO = z.infer<typeof UserBaseSchema>

/**
 * Schema phản hồi Health Check endpoint
 */
export const HealthCheckResponseSchema = z.object({
  status: z.enum(["ok", "error"]),
  timestamp: z.string(),
  uptime: z.number(),
  database: z.enum(["connected", "disconnected"]),
  environment: z.string(),
})

export type HealthCheckResponseDTO = z.infer<typeof HealthCheckResponseSchema>

// Export toàn bộ schemas từ các modules
export * from "./auth"
export * from "./card"
export * from "./set"
export * from "./folder"
export * from "./tag"
export * from "./srs"
export * from "./session"
export * from "./stats"
export * from "./goals"
export * from "./calendar"
export * from "./import-export"
