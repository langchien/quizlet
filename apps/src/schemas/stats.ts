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
 * Schema thống kê theo từng chế độ học
 */
export const ModeAccuracySchema = z.object({
  mode: z.string(),
  totalSessions: z.number(),
  totalCards: z.number(),
  correctCards: z.number(),
  accuracy: z.number(),
  totalDuration: z.number(),
})

export type ModeAccuracy = z.infer<typeof ModeAccuracySchema>

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
  recentSessions: z
    .array(
      z.object({
        id: z.string(),
        mode: z.string(),
        startedAt: z.string().or(z.date()),
        duration: z.number(),
        totalCards: z.number(),
        correctCards: z.number(),
        incorrectCards: z.number(),
        score: z.number(),
        studySet: z
          .object({
            id: z.string(),
            name: z.string(),
          })
          .nullable()
          .optional(),
      })
    )
    .optional(),
  weeklyChart: z
    .array(
      z.object({
        date: z.string(),
        dayName: z.string(),
        cardsStudied: z.number(),
        cardsCorrect: z.number(),
        timeSpent: z.number(),
        accuracy: z.number(),
      })
    )
    .optional(),
  modeAccuracies: z.array(ModeAccuracySchema).optional(),
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
  timeSpent: z.number().optional(),
})

export const HeatmapDataResponseSchema = z.array(HeatmapItemSchema)

export type HeatmapDataResponse = z.infer<typeof HeatmapDataResponseSchema>

/**
 * Schema tóm tắt tuần
 */
export const WeeklySummaryResponseSchema = z.object({
  thisWeek: z.object({
    cardsStudied: z.number(),
    timeSpentSeconds: z.number(),
    accuracy: z.number(),
    studyDays: z.number(),
  }),
  lastWeek: z.object({
    cardsStudied: z.number(),
    timeSpentSeconds: z.number(),
    accuracy: z.number(),
    studyDays: z.number(),
  }),
  growth: z.object({
    cardsStudiedPercent: z.number(),
    timeSpentPercent: z.number(),
    accuracyDiff: z.number(),
  }),
})

export type WeeklySummaryResponse = z.infer<typeof WeeklySummaryResponseSchema>

/**
 * Schema lịch sử phiên học có phân trang
 */
export const SessionHistoryItemSchema = z.object({
  id: z.string(),
  mode: z.string(),
  startedAt: z.union([z.string(), z.date()]),
  endedAt: z.union([z.string(), z.date()]).nullable(),
  duration: z.number(),
  totalCards: z.number(),
  correctCards: z.number(),
  incorrectCards: z.number(),
  score: z.number(),
  studySet: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
})

export const SessionsHistoryResponseSchema = z.object({
  sessions: z.array(SessionHistoryItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export type SessionsHistoryResponse = z.infer<
  typeof SessionsHistoryResponseSchema
>
