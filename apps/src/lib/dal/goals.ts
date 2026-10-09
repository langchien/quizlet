import { cache } from "react"
import { prisma } from "@/lib/prisma"

/**
 * Lấy mục tiêu học tập hàng ngày của người dùng (Cached per request)
 */
export const getUserGoal = cache(async (userId: string) => {
  let goal = await prisma.userGoal.findUnique({
    where: { userId },
  })

  if (!goal) {
    goal = await prisma.userGoal.create({
      data: {
        userId,
        dailyCardTarget: 20,
        dailyTimeTarget: 15,
        currentStreak: 0,
        longestStreak: 0,
      },
    })
  }

  return goal
})
