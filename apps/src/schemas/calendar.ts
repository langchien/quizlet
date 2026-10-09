import { z } from "zod"
import { CardStatusSchema } from "./index"

/**
 * Schema thống kê số thẻ ôn theo từng ngày trong tháng
 */
export const CalendarDayDueSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  dueCount: z.number(),
  newCount: z.number(),
  learningCount: z.number(),
  reviewCount: z.number(),
})

export const CalendarDueResponseSchema = z.object({
  year: z.number(),
  month: z.number(),
  days: z.record(z.string(), CalendarDayDueSchema),
  totalDueThisMonth: z.number(),
  totalDueToday: z.number(),
  overdueCount: z.number(),
})

export type CalendarDueResponse = z.infer<typeof CalendarDueResponseSchema>

/**
 * Schema thẻ đến hạn ôn tập hôm nay
 */
export const DueCardItemSchema = z.object({
  id: z.string(),
  term: z.string(),
  reading: z.string(),
  definition: z.string(),
  example: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  jlptLevel: z.string().nullable().optional(),
  wordType: z.string().nullable().optional(),
  studySet: z.object({
    id: z.string(),
    name: z.string(),
  }),
  srs: z.object({
    status: CardStatusSchema,
    easeFactor: z.number(),
    interval: z.number(),
    repetitions: z.number(),
    nextReviewDate: z.union([z.string(), z.date()]),
    lastReviewDate: z.union([z.string(), z.date()]).nullable().optional(),
    correctCount: z.number(),
    incorrectCount: z.number(),
    isOverdue: z.boolean(),
  }),
})

export type DueCardItem = z.infer<typeof DueCardItemSchema>

/**
 * Schema phản hồi Today / Due cards
 */
export const CalendarTodayResponseSchema = z.object({
  today: z.string(),
  totalDue: z.number(),
  overdueCount: z.number(),
  dueTodayCount: z.number(),
  cards: z.array(DueCardItemSchema),
  forecast7Days: z.array(
    z.object({
      date: z.string(),
      dayName: z.string(),
      dueCount: z.number(),
    })
  ),
})

export type CalendarTodayResponse = z.infer<typeof CalendarTodayResponseSchema>
