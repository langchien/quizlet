import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import {
  REFRESH_TOKEN_COOKIE,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    let token = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value

    // Nếu không có trong cookie, kiểm tra body
    if (!token) {
      try {
        const body = await req.json()
        token = body?.refreshToken
      } catch {
        // Body rỗng
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "Không tìm thấy Refresh Token" },
        { status: 401 }
      )
    }

    // Xác thực token
    const payload = await verifyRefreshToken(token)
    if (!payload?.userId) {
      return NextResponse.json(
        { error: "Refresh Token không hợp lệ hoặc đã hết hạn" },
        { status: 401 }
      )
    }

    // Kiểm tra user có tồn tại không
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

    if (!user) {
      return NextResponse.json(
        { error: "Người dùng không còn tồn tại" },
        { status: 401 }
      )
    }

    // Ký token mới
    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
    })
    const newRefreshToken = await signRefreshToken({
      userId: user.id,
    })

    // Cập nhật cookies
    await setAuthCookies(cookieStore, newAccessToken, newRefreshToken)

    return NextResponse.json({
      message: "Làm mới phiên đăng nhập thành công",
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    console.error("❌ Lỗi API Refresh Token:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi làm mới token." },
      { status: 500 }
    )
  }
}
