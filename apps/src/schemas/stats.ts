import { z } from "zod"

/**
 * Schema thống kê học tập theo ngày
 */
export const DailyStatsResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(),
  cardsStudied: z.number(),
  cardsCorrect: z.number(),
  cardsIncorrect: z.number(),
  timeSpent: z.number(),
  newCardsSeen: z.number(),
  reviewCards: z.number(),
  streak: z.number(),
  accuracy: z.number().optional(),
})

export type DailyStatsResponse = z.infer<typeof DailyStatsResponseSchema>

/**
 * Schema tổng quan Dashboard
 */
export const DashboardStatsResponseSchema = z.object({
  cardsStudiedToday: z.number(),
  cardsCorrectToday: z.number(),
  cardsIncorrectToday: z.number(),
  timeSpentTodaySeconds: z.number(),
  accuracyToday: z.number(),
  currentStreak: z.number(),
  longestStreak: z.number(),
  dailyGoal: z.object({
    cardTarget: z.number(),
    timeTargetMinutes: z.number(),
    cardProgress: z.number(),
    timeProgressMinutes: z.number(),
    isCardTargetMet: z.boolean(),
    isTimeTargetMet: z.boolean(),
  }),
  dueCardsCount: z.number(),
  totalSetsCount: z.number(),
  totalCardsCount: z.number(),
  masteredCardsCount: z.number(),
})

export type DashboardStatsResponse = z.infer<
  typeof DashboardStatsResponseSchema
>

/**
 * Schema Heatmap 365 ngày
 */
export const HeatmapItemSchema = z.object({
  date: z.string(),
  count: z.number(),
  level: z.number().min(0).max(4),
})

export const HeatmapDataResponseSchema = z.array(HeatmapItemSchema)

export type HeatmapDataResponse = z.infer<typeof HeatmapDataResponseSchema>
