import { z } from "zod"

/**
 * Schema xác thực dữ liệu Đăng nhập
 */
export const LoginBodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Định dạng email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
})

export type LoginBody = z.infer<typeof LoginBodySchema>

/**
 * Schema xác thực dữ liệu Đăng ký tài khoản
 */
export const RegisterBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Họ và tên phải có ít nhất 2 ký tự")
      .max(50, "Họ và tên không được vượt quá 50 ký tự"),
    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email")
      .email("Định dạng email không hợp lệ"),
    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .max(100, "Mật khẩu quá dài"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

export type RegisterBody = z.infer<typeof RegisterBodySchema>

/**
 * Schema làm mới Access Token
 */
export const RefreshTokenBodySchema = z.object({
  refreshToken: z.string().optional(),
})

export type RefreshTokenBody = z.infer<typeof RefreshTokenBodySchema>

/**
 * Schema cập nhật thông tin cá nhân và cài đặt
 */
export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự").optional(),
  avatar: z.string().nullable().optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .optional(),
  settings: z
    .object({
      theme: z.enum(["light", "dark", "system"]).optional(),
      fontSize: z.enum(["sm", "md", "lg"]).optional(),
      japaneseFont: z.string().optional(),
      srsMode: z.enum(["auto", "simple", "advanced"]).optional(),
      dailyGoal: z.number().int().positive().optional(),
      dailyTimeTarget: z.number().int().positive().optional(),
      keyboardShortcuts: z.boolean().optional(),
      autoPlayAudio: z.boolean().optional(),
      ttsRate: z.number().min(0.5).max(2.0).optional(),
      ttsVoice: z.string().optional(),
      customShortcuts: z.record(z.string(), z.string()).optional(),
    })
    .passthrough()
    .optional(),
})

export type UpdateProfileBody = z.infer<typeof UpdateProfileSchema>

/**
 * Schema đổi mật khẩu
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

export type ChangePasswordBody = z.infer<typeof ChangePasswordSchema>

/**
 * Schema phản hồi Authentication thành công
 */
export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    avatar: z.string().nullable().optional(),
    settings: z.any().optional(),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
  }),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  message: z.string().optional(),
})

export type AuthResponse = z.infer<typeof AuthResponseSchema>
