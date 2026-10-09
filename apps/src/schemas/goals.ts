import { z } from "zod"

/**
 * Schema mục tiêu học tập của người dùng
 */
export const UserGoalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dailyCardTarget: z.number().int().min(1, "Mục tiêu tối thiểu 1 thẻ/ngày"),
  dailyTimeTarget: z.number().int().min(1, "Mục tiêu tối thiểu 1 phút/ngày"),
  currentStreak: z.number().int(),
  longestStreak: z.number().int(),
  lastStudyDate: z.union([z.date(), z.string()]).nullable().optional(),
})

export type UserGoal = z.infer<typeof UserGoalSchema>

/**
 * Schema cập nhật mục tiêu học tập
 */
export const UpdateGoalSchema = z.object({
  dailyCardTarget: z
    .number()
    .int()
    .min(1, "Mục tiêu tối thiểu 1 thẻ/ngày")
    .max(500, "Mục tiêu tối đa 500 thẻ/ngày")
    .optional(),
  dailyTimeTarget: z
    .number()
    .int()
    .min(1, "Mục tiêu tối thiểu 1 phút/ngày")
    .max(720, "Mục tiêu tối đa 720 phút/ngày")
    .optional(),
})

export type UpdateGoalBody = z.infer<typeof UpdateGoalSchema>
