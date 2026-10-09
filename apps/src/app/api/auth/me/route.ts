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

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies()
    let token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

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

    if (!userId) {
      const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
      if (refreshToken) {
        const refreshPayload = await verifyRefreshToken(refreshToken)
        if (refreshPayload?.userId) {
          userId = refreshPayload.userId
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Chưa đăng nhập hoặc phiên đăng nhập đã hết hạn" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { UpdateProfileSchema } = await import("@/schemas/auth")
    const parseResult = UpdateProfileSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu không hợp lệ",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const validatedData = parseResult.data

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    // Cập nhật tên
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name
    }

    // Cập nhật avatar
    if (validatedData.avatar !== undefined) {
      updateData.avatar = validatedData.avatar
    }

    // Đổi mật khẩu nếu có
    if (validatedData.newPassword) {
      if (!validatedData.currentPassword) {
        return NextResponse.json(
          { error: "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới" },
          { status: 400 }
        )
      }

      const { comparePassword, hashPassword } = await import("@/lib/auth")
      const isPasswordValid = await comparePassword(
        validatedData.currentPassword,
        currentUser.password
      )

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Mật khẩu hiện tại không chính xác" },
          { status: 400 }
        )
      }

      updateData.password = await hashPassword(validatedData.newPassword)
    }

    // Cập nhật settings
    if (validatedData.settings) {
      const currentSettings =
        typeof currentUser.settings === "object" &&
        currentUser.settings !== null
          ? (currentUser.settings as Record<string, unknown>)
          : {}

      const mergedSettings = {
        ...currentSettings,
        ...validatedData.settings,
      }
      updateData.settings = mergedSettings

      // Nếu có cập nhật mục tiêu học tập dailyGoal / dailyTimeTarget, đồng bộ vào UserGoal
      const dailyCardTarget =
        validatedData.settings.dailyGoal !== undefined
          ? validatedData.settings.dailyGoal
          : undefined
      const dailyTimeTarget =
        validatedData.settings.dailyTimeTarget !== undefined
          ? validatedData.settings.dailyTimeTarget
          : undefined

      if (dailyCardTarget !== undefined || dailyTimeTarget !== undefined) {
        await prisma.userGoal.upsert({
          where: { userId },
          create: {
            userId,
            dailyCardTarget: dailyCardTarget ?? 20,
            dailyTimeTarget: dailyTimeTarget ?? 15,
          },
          update: {
            ...(dailyCardTarget !== undefined ? { dailyCardTarget } : {}),
            ...(dailyTimeTarget !== undefined ? { dailyTimeTarget } : {}),
          },
        })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return NextResponse.json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser,
    })
  } catch (error) {
    console.error("❌ Lỗi API Update Me:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi cập nhật thông tin người dùng." },
      { status: 500 }
    )
  }
}
