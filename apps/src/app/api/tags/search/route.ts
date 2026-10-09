import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

/**
 * GET /api/tags/search?q=... — Tự động hoàn thiện tìm kiếm nhãn theo từ khoá
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
    const q = searchParams.get("q")?.trim() || ""
    const limit = Math.min(
      20,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    )

    const tags = await prisma.tag.findMany({
      where: {
        userId: user.id,
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      take: limit,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { cardTags: true },
        },
      },
    })

    const items = tags.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      cardCount: t._count.cardTags,
    }))

    return NextResponse.json(items)
  } catch (error) {
    console.error("❌ Lỗi GET /api/tags/search:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi tìm kiếm nhãn." },
      { status: 500 }
    )
  }
}
