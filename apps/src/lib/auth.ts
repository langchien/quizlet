import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

// Định nghĩa tên cookie bảo mật
export const ACCESS_TOKEN_COOKIE = "nihomemo_access_token"
export const REFRESH_TOKEN_COOKIE = "nihomemo_refresh_token"

// Chuyển secret key sang Uint8Array cho jose
const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET)
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET)

export interface JWTPayload {
  userId: string
  email: string
}

/**
 * Băm mật khẩu với bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * So sánh mật khẩu plain text với chuỗi hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Ký Access Token (mặc định 15 phút)
 */
export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN || "15m")
    .sign(accessSecret)
}

/**
 * Ký Refresh Token (mặc định 7 ngày)
 */
export async function signRefreshToken(payload: {
  userId: string
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN || "7d")
    .sign(refreshSecret)
}

/**
 * Xác thực Access Token
 */
export async function verifyAccessToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

/**
 * Xác thực Refresh Token
 */
export async function verifyRefreshToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret)
    return payload as unknown as { userId: string }
  } catch {
    return null
  }
}

/**
 * Thiết lập Cookies xác thực (HttpOnly, Secure, SameSite)
 */
export async function setAuthCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  accessToken: string,
  refreshToken: string
) {
  const isProduction = process.env.NODE_ENV === "production"

  // Access Token Cookie (15 phút)
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 phút
  })

  // Refresh Token Cookie (7 ngày)
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 ngày
  })
}

/**
 * Xóa Cookies xác thực khi đăng xuất
 */
export async function clearAuthCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
}

/**
 * Lấy thông tin User hiện tại từ cookies trong Server Component hoặc Route Handler
 */
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  if (accessToken) {
    const payload = await verifyAccessToken(accessToken)
    if (payload?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          settings: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      if (user) return user
    }
  }

  // Nếu Access Token hết hạn, thử xác thực bằng Refresh Token
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
  if (refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken)
    if (refreshPayload?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: refreshPayload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          settings: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      return user
    }
  }

  return null
}
