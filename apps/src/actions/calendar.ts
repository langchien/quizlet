"use server"

import { getCurrentUser } from "@/lib/auth"
import { getCalendarDue } from "@/lib/dal/calendar"
import type { ActionResponse } from "./sets"

/**
 * Server Action: Lấy dữ liệu thẻ đến hạn ôn tập theo tháng
 */
export async function getCalendarMonthDueAction(
  year: number,
  month: number
): Promise<ActionResponse<Awaited<ReturnType<typeof getCalendarDue>>>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để xem lịch ôn tập." }
    }

    const data = await getCalendarDue(user.id, year, month)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Lỗi getCalendarMonthDueAction:", error)
    return { success: false, error: "Đã xảy ra lỗi khi tải dữ liệu lịch." }
  }
}
