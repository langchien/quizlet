"use server"

import { getCurrentUser } from "@/lib/auth"
import {
  getHeatmapData,
  getDailyStats,
  getStudySessionsHistory,
} from "@/lib/dal/stats"
import type { ActionResponse } from "./sets"
import type {
  DailyStatsResponse,
  HeatmapDataResponse,
  SessionsHistoryResponse,
} from "@/schemas/stats"

/**
 * Server Action: Lấy dữ liệu Heatmap theo năm hoặc 365 ngày gần nhất
 */
export async function getHeatmapDataAction(
  year?: string
): Promise<ActionResponse<HeatmapDataResponse>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để xem thống kê." }
    }

    const data = await getHeatmapData(
      user.id,
      year === "recent" ? undefined : year
    )
    return { success: true, data }
  } catch (error) {
    console.error("❌ Lỗi getHeatmapDataAction:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi khi tải dữ liệu biểu đồ nhiệt.",
    }
  }
}

/**
 * Server Action: Lấy thống kê chi tiết theo khoảng thời gian (7, 30, 90, all)
 */
export async function getDailyStatsAction(
  timeRange: string
): Promise<ActionResponse<DailyStatsResponse[]>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để xem thống kê." }
    }

    const now = new Date()
    const toDate = now.toISOString().split("T")[0]
    let fromDate: string | undefined

    if (timeRange === "7") {
      const d = new Date(now)
      d.setDate(d.getDate() - 6)
      fromDate = d.toISOString().split("T")[0]
    } else if (timeRange === "30") {
      const d = new Date(now)
      d.setDate(d.getDate() - 29)
      fromDate = d.toISOString().split("T")[0]
    } else if (timeRange === "90") {
      const d = new Date(now)
      d.setDate(d.getDate() - 89)
      fromDate = d.toISOString().split("T")[0]
    }

    const data = await getDailyStats(user.id, fromDate, toDate)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Lỗi getDailyStatsAction:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi khi tải dữ liệu thống kê theo ngày.",
    }
  }
}

/**
 * Server Action: Lấy lịch sử phiên học có phân trang và lọc theo chế độ
 */
export async function getSessionsHistoryAction(
  page: number,
  limit: number,
  mode?: string
): Promise<ActionResponse<SessionsHistoryResponse>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để xem lịch sử phiên học.",
      }
    }

    const result = await getStudySessionsHistory(user.id, { page, limit, mode })
    return { success: true, data: result as unknown as SessionsHistoryResponse }
  } catch (error) {
    console.error("❌ Lỗi getSessionsHistoryAction:", error)
    return { success: false, error: "Đã xảy ra lỗi khi tải lịch sử phiên học." }
  }
}
