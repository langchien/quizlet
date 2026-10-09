import { z } from "zod"
import { STUDY_MODES } from "@/types"

export const StudyModeEnum = z.enum(STUDY_MODES)

/**
 * Schema bắt đầu phiên học tập
 */
export const StartSessionSchema = z.object({
  studySetId: z.string().optional().nullable(),
  mode: StudyModeEnum,
  shuffle: z.boolean().default(false),
  reverse: z.boolean().optional().default(false),
  filterByStatus: z
    .enum(["New", "Learning", "Review", "Mastered", "All"])
    .default("All"),
  filterByTags: z.array(z.string()).default([]),
  limit: z.number().int().positive().optional(),
})

export type StartSessionBody = z.input<typeof StartSessionSchema>

/**
 * Schema ghi nhận câu trả lời cho một thẻ
 */
export const AnswerQuestionSchema = z.object({
  sessionId: z.string().optional(),
  cardId: z.string().min(1),
  isCorrect: z.boolean(),
  userAnswer: z.string().optional(),
  timeTaken: z.number().int().min(0).default(0), // giây
})

export type AnswerQuestionBody = z.infer<typeof AnswerQuestionSchema>

/**
 * Schema kết thúc phiên học
 */
export const EndSessionSchema = z.object({
  sessionId: z.string().optional(),
  studySetId: z.string().optional().nullable(),
  mode: StudyModeEnum,
  duration: z.number().int().min(0), // giây
  totalCards: z.number().int().min(0),
  correctCards: z.number().int().min(0),
  incorrectCards: z.number().int().min(0),
  score: z.number().min(0).max(100),
})

export type EndSessionBody = z.infer<typeof EndSessionSchema>

/**
 * Schema chi tiết phiên học trả về
 */
export const SessionResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  studySetId: z.string().nullable().optional(),
  mode: StudyModeEnum,
  startedAt: z.union([z.date(), z.string()]),
  endedAt: z.union([z.date(), z.string()]).nullable().optional(),
  duration: z.number(),
  totalCards: z.number(),
  correctCards: z.number(),
  incorrectCards: z.number(),
  score: z.number(),
  createdAt: z.union([z.date(), z.string()]),
  studySet: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
})

export type SessionResponse = z.infer<typeof SessionResponseSchema>
