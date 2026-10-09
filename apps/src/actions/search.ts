"use server"

import { getCurrentUser } from "@/lib/auth"
import { globalSearch, type SearchResults } from "@/lib/dal/search"

export type SearchActionResult =
  | { success: true; data: SearchResults; error?: never }
  | { success: false; error: string; data?: never }

/**
 * Tìm kiếm toàn cục trên bộ thẻ, thẻ học, thư mục và nhãn
 */
export async function globalSearchAction(
  query: string,
  limit: number = 10
): Promise<SearchActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const results = await globalSearch(user.id, query, limit)
    return { success: true, data: results }
  } catch (error) {
    console.error("❌ Lỗi globalSearchAction:", error)
    return { success: false, error: "Đã xảy ra lỗi khi tìm kiếm." }
  }
}
