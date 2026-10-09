import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { CreateTagSchema } from "@/schemas/tag"
import type { Prisma } from "@/generated/prisma/client"

/**
 * GET /api/tags — Lấy danh sách tất cả nhãn của người dùng kèm số lượng thẻ
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để truy cập tài nguyên này." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")?.trim()

    const where: Prisma.TagWhereInput = {
      userId: user.id,
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" }
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { cardTags: true },
        },
      },
    })

    const items = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      userId: tag.userId,
      cardCount: tag._count.cardTags,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    }))

    return NextResponse.json(items)
  } catch (error) {
    console.error("❌ Lỗi GET /api/tags:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy danh sách nhãn." },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tags — Tạo nhãn mới
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = CreateTagSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu nhãn không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { name, color } = validation.data

    // Kiểm tra tên nhãn trùng lặp cho cùng người dùng
    const existing = await prisma.tag.findFirst({
      where: {
        userId: user.id,
        name: { equals: name, mode: "insensitive" },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Nhãn "${name}" đã tồn tại trong tài khoản của bạn.` },
        { status: 409 }
      )
    }

    const newTag = await prisma.tag.create({
      data: {
        name,
        color: color || "#3B82F6",
        userId: user.id,
      },
    })

    return NextResponse.json(
      {
        ...newTag,
        cardCount: 0,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Lỗi POST /api/tags:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi tạo nhãn mới." },
      { status: 500 }
    )
  }
}
