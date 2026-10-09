import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import type { Prisma, StudyMode } from "@/generated/prisma/client"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để truy cập lịch sử phiên học." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    )
    const mode = searchParams.get("mode") as StudyMode | null
    const setId = searchParams.get("setId")

    const where: Prisma.StudySessionWhereInput = {
      userId: user.id,
      ...(mode ? { mode } : {}),
      ...(setId ? { studySetId: setId } : {}),
    }

    const [total, sessions] = await Promise.all([
      prisma.studySession.count({ where }),
      prisma.studySession.findMany({
        where,
        orderBy: { startedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          studySet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/stats/sessions:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy danh sách phiên học." },
      { status: 500 }
    )
  }
}
