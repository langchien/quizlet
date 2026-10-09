import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { UpdateGoalSchema } from "@/schemas/goals"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xem mục tiêu học tập." },
        { status: 401 }
      )
    }

    let goal = await prisma.userGoal.findUnique({
      where: { userId: user.id },
    })

    if (!goal) {
      goal = await prisma.userGoal.create({
        data: {
          userId: user.id,
          dailyCardTarget: 20,
          dailyTimeTarget: 15,
          currentStreak: 0,
          longestStreak: 0,
        },
      })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error("❌ Lỗi GET /api/goals:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy mục tiêu học tập." },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để cập nhật mục tiêu học tập." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = UpdateGoalSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu mục tiêu không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { dailyCardTarget, dailyTimeTarget } = validation.data

    const goal = await prisma.userGoal.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        dailyCardTarget: dailyCardTarget ?? 20,
        dailyTimeTarget: dailyTimeTarget ?? 15,
        currentStreak: 0,
        longestStreak: 0,
      },
      update: {
        ...(dailyCardTarget !== undefined ? { dailyCardTarget } : {}),
        ...(dailyTimeTarget !== undefined ? { dailyTimeTarget } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Cập nhật mục tiêu thành công.",
      goal,
    })
  } catch (error) {
    console.error("❌ Lỗi PATCH /api/goals:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi cập nhật mục tiêu." },
      { status: 500 }
    )
  }
}
