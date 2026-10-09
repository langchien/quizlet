import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import {
  comparePassword,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from "@/lib/auth"
import { LoginBodySchema } from "@/schemas/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = LoginBodySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu đăng nhập không hợp lệ",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data
    const normalizedEmail = email.toLowerCase().trim()

    // Tìm kiếm user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác" },
        { status: 401 }
      )
    }

    // So sánh mật khẩu
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác" },
        { status: 401 }
      )
    }

    // Ký tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
    })
    const refreshToken = await signRefreshToken({
      userId: user.id,
    })

    // Thiết lập cookies
    const cookieStore = await cookies()
    await setAuthCookies(cookieStore, accessToken, refreshToken)

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      settings: user.settings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json({
      message: "Đăng nhập thành công",
      user: userResponse,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("❌ Lỗi API Login:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi đăng nhập. Vui lòng thử lại sau." },
      { status: 500 }
    )
  }
}
