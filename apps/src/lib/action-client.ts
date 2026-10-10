import { getCurrentUser } from "@/lib/auth"
import type { z } from "zod"

export type SafeUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>

export type ActionResponse<T = unknown> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

/**
 * Tiện ích Safe Action Wrapper yêu cầu Authentication và Zod validation
 * Giúp loại bỏ hoàn toàn boilerplate (getCurrentUser, safeParse, try/catch)
 */
export function createAuthedAction<TInput, TOutput>(
  schema: z.ZodType<TInput>,
  handler: (params: { input: TInput; user: SafeUser }) => Promise<TOutput>
) {
  return async (rawInput: unknown): Promise<ActionResponse<TOutput>> => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        return {
          success: false,
          error: "Vui lòng đăng nhập để thực hiện thao tác này.",
        }
      }

      const validation = schema.safeParse(rawInput)
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
        }
      }

      const data = await handler({ input: validation.data, user })
      return { success: true, data }
    } catch (error) {
      console.error("❌ Action error:", error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi máy chủ khi xử lý yêu cầu.",
      }
    }
  }
}

/**
 * Tiện ích Safe Action Wrapper chỉ yêu cầu Authentication (cho các action có input dạng ID, FormData hoặc tự kiểm tra)
 */
export function createSimpleAuthedAction<TInput, TOutput>(
  handler: (params: { input: TInput; user: SafeUser }) => Promise<TOutput>
) {
  return async (input: TInput): Promise<ActionResponse<TOutput>> => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        return {
          success: false,
          error: "Vui lòng đăng nhập để thực hiện thao tác này.",
        }
      }

      const data = await handler({ input, user })
      return { success: true, data }
    } catch (error) {
      console.error("❌ Action error:", error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi máy chủ khi xử lý yêu cầu.",
      }
    }
  }
}
