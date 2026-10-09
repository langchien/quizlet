import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { CreateSetSchema } from "@/schemas/set"
import type { Prisma } from "@/generated/prisma/client"

/**
 * GET /api/sets — Lấy danh sách bộ thẻ của người dùng (kèm phân trang, tìm kiếm, lọc)
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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    )
    const search = searchParams.get("search")?.trim() || ""
    const folderId = searchParams.get("folderId")
    const sortBy = searchParams.get("sortBy") || "updatedAt"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc"

    // Xây dựng điều kiện lọc Prisma
    const where: Prisma.StudySetWhereInput = {
      userId: user.id,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (folderId !== undefined && folderId !== null && folderId !== "") {
      if (folderId === "none" || folderId === "null" || folderId === "root") {
        where.folderId = null
      } else {
        where.folderId = folderId
      }
    }

    // Xác định thứ tự sắp xếp
    let orderBy: Prisma.StudySetOrderByWithRelationInput = {
      updatedAt: sortOrder,
    }
    if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder }
    } else if (sortBy === "name") {
      orderBy = { name: sortOrder }
    } else if (sortBy === "cardCount") {
      orderBy = { cardCount: sortOrder }
    }

    // Đếm tổng số bản ghi
    const total = await prisma.studySet.count({ where })
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    // Lấy danh sách bộ thẻ kèm thư mục và thông tin phiên học gần nhất
    const sets = await prisma.studySet.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        studySessions: {
          where: { userId: user.id },
          orderBy: { startedAt: "desc" },
          take: 1,
          select: { startedAt: true },
        },
        cards: {
          select: {
            id: true,
            srsData: {
              where: { userId: user.id },
              select: { status: true },
            },
          },
        },
      },
    })

    // Tính toán tiến độ học và định dạng kết quả trả về
    const items = sets.map((set) => {
      let masteredCount = 0
      let learningCount = 0
      let newCount = 0

      for (const card of set.cards) {
        const srs = card.srsData[0]
        if (!srs || srs.status === "New") {
          newCount++
        } else if (srs.status === "Mastered") {
          masteredCount++
        } else {
          learningCount++
        }
      }

      const totalCards = set.cardCount
      const percentage =
        totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0

      const lastStudiedAt = set.studySessions[0]?.startedAt || null

      return {
        id: set.id,
        name: set.name,
        description: set.description,
        sourceLanguage: set.sourceLanguage,
        targetLanguage: set.targetLanguage,
        folderId: set.folderId,
        userId: set.userId,
        cardCount: set.cardCount,
        createdAt: set.createdAt,
        updatedAt: set.updatedAt,
        folder: set.folder,
        lastStudiedAt,
        progress: {
          mastered: masteredCount,
          learning: learningCount,
          new: newCount,
          percentage,
        },
      }
    })

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages,
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/sets:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy danh sách bộ thẻ." },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sets — Tạo mới bộ thẻ học tập
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
    const validation = CreateSetSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu tạo bộ thẻ không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { name, description, sourceLanguage, targetLanguage, folderId } =
      validation.data

    // Kiểm tra folderId nếu có xem có hợp lệ và thuộc về người dùng không
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId: user.id },
      })

      if (!folder) {
        return NextResponse.json(
          {
            error:
              "Thư mục đã chọn không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
          },
          { status: 404 }
        )
      }
    }

    // Tạo bộ thẻ trong database
    const newSet = await prisma.studySet.create({
      data: {
        name,
        description: description || null,
        sourceLanguage: sourceLanguage || "ja",
        targetLanguage: targetLanguage || "vi",
        folderId: folderId || null,
        userId: user.id,
        cardCount: 0,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        ...newSet,
        progress: {
          mastered: 0,
          learning: 0,
          new: 0,
          percentage: 0,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Lỗi POST /api/sets:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi tạo bộ thẻ mới." },
      { status: 500 }
    )
  }
}
