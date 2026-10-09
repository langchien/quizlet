"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { UpdateGoalSchema, type UpdateGoalBody } from "@/schemas/goals"
import type { UserGoal } from "@/generated/prisma/client"
import type { ActionResponse } from "./sets"

/**
 * Server Action: Cập nhật mục tiêu học tập hàng ngày
 */
export async function updateGoalAction(
  input: UpdateGoalBody
): Promise<ActionResponse<UserGoal>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để thực hiện thao tác này.",
      }
    }

    const validation = UpdateGoalSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          "Dữ liệu mục tiêu không hợp lệ.",
      }
    }

    const { dailyCardTarget, dailyTimeTarget } = validation.data

    const goal = await prisma.userGoal.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        dailyCardTarget: dailyCardTarget ?? 20,
        dailyTimeTarget: dailyTimeTarget ?? 15,
        currentStreak: 0,
        longestStreak: 0,
      },
      update: {
        ...(dailyCardTarget !== undefined ? { dailyCardTarget } : {}),
        ...(dailyTimeTarget !== undefined ? { dailyTimeTarget } : {}),
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/settings")

    return { success: true, data: goal }
  } catch (error) {
    console.error("❌ Lỗi updateGoalAction:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi máy chủ khi cập nhật mục tiêu.",
    }
  }
}
