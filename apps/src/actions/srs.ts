"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { ReviewCardSchema, type ReviewCardBody } from "@/schemas/srs"
import { processSRSReview } from "@/lib/srs"
import { getDueCards, getDueCount } from "@/lib/dal/srs"
import type { ActionResponse } from "./sets"
import type { SRSData } from "@/generated/prisma/client"

/**
 * Server Action: Đánh giá thẻ trong quá trình ôn tập SRS (Again, Hard, Good, Easy)
 */
export async function reviewCardSRSAction(
  input: ReviewCardBody
): Promise<ActionResponse<SRSData>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để đánh giá SRS." }
    }

    const validation = ReviewCardSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          "Dữ liệu đánh giá SRS không hợp lệ.",
      }
    }

    const { cardId, rating, timeTaken, isCorrect } = validation.data

    const updatedSRS = await processSRSReview({
      userId: user.id,
      cardId,
      rating,
      timeTaken,
      isCorrect,
    })

    revalidatePath("/calendar")
    revalidatePath("/dashboard")
    revalidatePath("/stats")

    return { success: true, data: updatedSRS }
  } catch (error) {
    console.error("❌ Lỗi reviewCardSRSAction:", error)
    return { success: false, error: "Đã xảy ra lỗi máy chủ khi cập nhật SRS." }
  }
}

/**
 * Server Action: Lấy danh sách các thẻ cần ôn tập
 */
export async function getDueCardsAction(
  studySetId?: string | null,
  limit?: number
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để lấy danh sách thẻ.",
      }
    }

    const data = await getDueCards(user.id, { studySetId, limit })
    return { success: true, data }
  } catch (error) {
    console.error("❌ Lỗi getDueCardsAction:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi khi lấy danh sách thẻ cần ôn.",
    }
  }
}

/**
 * Server Action: Lấy số lượng thẻ cần ôn tập
 */
export async function getDueCountAction(studySetId?: string | null) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để xem số lượng thẻ.",
      }
    }

    const data = await getDueCount(user.id, studySetId)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Lỗi getDueCountAction:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi khi đếm số lượng thẻ cần ôn.",
    }
  }
}
