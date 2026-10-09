import { z } from "zod"
import { CARD_STATUSES } from "@/types"

export const CardStatusEnum = z.enum(CARD_STATUSES)

/**
 * Schema đánh giá thẻ trong quá trình ôn tập SRS
 */
export const ReviewCardSchema = z.object({
  cardId: z.string().min(1, "Vui lòng chọn thẻ"),
  rating: z.union([
    z.enum(["again", "hard", "good", "easy"]),
    z.number().int().min(0).max(5),
  ]),
  timeTaken: z.number().int().min(0).default(0), // Số giây trả lời
  isCorrect: z.boolean().optional(),
})

export type ReviewCardBody = z.infer<typeof ReviewCardSchema>

/**
 * Schema phản hồi dữ liệu SRS của thẻ
 */
export const SRSDataResponseSchema = z.object({
  id: z.string(),
  cardId: z.string(),
  userId: z.string(),
  status: CardStatusEnum,
  easeFactor: z.number(),
  interval: z.number(),
  repetitions: z.number(),
  nextReviewDate: z.union([z.date(), z.string()]),
  lastReviewDate: z.union([z.date(), z.string()]).nullable().optional(),
  correctCount: z.number(),
  incorrectCount: z.number(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
})

export type SRSDataResponse = z.infer<typeof SRSDataResponseSchema>

/**
 * Schema danh sách thẻ đến hạn ôn tập hôm nay
 */
export const DueCardsResponseSchema = z.object({
  dueCount: z.number(),
  newCount: z.number(),
  reviewCount: z.number(),
  cards: z.array(z.record(z.string(), z.unknown())),
})

export type DueCardsResponse = z.infer<typeof DueCardsResponseSchema>
