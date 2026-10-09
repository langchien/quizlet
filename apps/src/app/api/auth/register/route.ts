import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from "@/lib/auth"
import { RegisterBodySchema } from "@/schemas/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = RegisterBodySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu đăng ký không hợp lệ",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { email, name, password } = validation.data
    const normalizedEmail = email.toLowerCase().trim()

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.",
        },
        { status: 409 }
      )
    }

    // Băm mật khẩu
    const hashedPassword = await hashPassword(password)

    // Tạo user và mục tiêu mặc định
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        password: hashedPassword,
        settings: {
          theme: "system",
          srsMode: "auto",
          dailyGoal: 20,
          keyboardShortcuts: true,
        },
        goal: {
          create: {
            dailyCardTarget: 20,
            dailyTimeTarget: 15,
            currentStreak: 0,
            longestStreak: 0,
          },
        },
      },
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

    // Ký tokens
    const accessToken = await signAccessToken({
      userId: newUser.id,
      email: newUser.email,
    })
    const refreshToken = await signRefreshToken({
      userId: newUser.id,
    })

    // Thiết lập cookies
    const cookieStore = await cookies()
    await setAuthCookies(cookieStore, accessToken, refreshToken)

    return NextResponse.json(
      {
        message: "Đăng ký tài khoản thành công",
        user: newUser,
        accessToken,
        refreshToken,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Lỗi API Register:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi đăng ký. Vui lòng thử lại sau." },
      { status: 500 }
    )
  }
}
