import { z } from "zod"
import { CARD_STATUSES, JLPT_LEVELS, STUDY_MODES, WORD_TYPES } from "@/types"

/**
 * Zod schemas cho các Enum hệ thống
 */
export const JLPTLevelSchema = z.enum(JLPT_LEVELS)
export const WordTypeSchema = z.enum(WORD_TYPES)
export const CardStatusSchema = z.enum(CARD_STATUSES)
export const StudyModeSchema = z.enum(STUDY_MODES)

/**
 * Schema thông tin người dùng cơ bản
 */
export const UserBaseSchema = z.object({
  id: z.string().cuid(),
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
