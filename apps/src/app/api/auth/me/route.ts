import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    let token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

    // Kiểm tra Authorization header
    const authHeader = req.headers.get("authorization")
    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }

    let userId: string | null = null

    if (token) {
      const payload = await verifyAccessToken(token)
      if (payload?.userId) {
        userId = payload.userId
      }
    }

    // Nếu không có hoặc token hết hạn, thử refresh token từ cookie
    if (!userId) {
      const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
      if (refreshToken) {
        const refreshPayload = await verifyRefreshToken(refreshToken)
        if (refreshPayload?.userId) {
          userId = refreshPayload.userId

          // Tự động cấp cặp token mới
          const newAccess = await signAccessToken({
            userId: refreshPayload.userId,
            email: "",
          })
          const newRefresh = await signRefreshToken({
            userId: refreshPayload.userId,
          })
          await setAuthCookies(cookieStore, newAccess, newRefresh)
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Chưa đăng nhập hoặc phiên đăng nhập đã hết hạn" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
        goal: {
          select: {
            dailyCardTarget: true,
            dailyTimeTarget: true,
            currentStreak: true,
            longestStreak: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user,
    })
  } catch (error) {
    console.error("❌ Lỗi API Get Me:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy thông tin người dùng." },
      { status: 500 }
    )
  }
}
