import { z } from "zod"

/**
 * Schema xác thực các biến môi trường của ứng dụng
 */
const envSchema = z.object({
  PORT: z.string().optional().default("30001"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL không được để trống"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(8, "JWT_ACCESS_SECRET phải có tối thiểu 8 ký tự"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(8, "JWT_REFRESH_SECRET phải có tối thiểu 8 ký tự"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:30001"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
})

// Kiểm tra và validate biến môi trường ngay khi khởi động
const parsedEnv = envSchema.safeParse({
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
})

if (!parsedEnv.success) {
  console.error("❌ Lỗi cấu hình biến môi trường:", parsedEnv.error.format())
  throw new Error("Cấu hình biến môi trường không hợp lệ.")
}

export const env = parsedEnv.data
