import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { UpdateSetSchema } from "@/schemas/set"

interface RouteProps {
  params: Promise<{ id: string }>
}

/**
 * GET /api/sets/[id] — Chi tiết bộ thẻ kèm danh sách thẻ học, nhãn và tiến độ SRS
 */
export async function GET(req: Request, { params }: RouteProps) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để truy cập tài nguyên này." },
        { status: 401 }
      )
    }

    const { id } = await params

    const set = await prisma.studySet.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        cards: {
          orderBy: { order: "asc" },
          include: {
            cardTags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    color: true,
                  },
                },
              },
            },
            srsData: {
              where: { userId: user.id },
              take: 1,
            },
          },
        },
        studySessions: {
          where: { userId: user.id },
          orderBy: { startedAt: "desc" },
          take: 1,
          select: { startedAt: true },
        },
      },
    })

    if (!set) {
      return NextResponse.json(
        { error: "Không tìm thấy bộ thẻ hoặc bạn không có quyền truy cập." },
        { status: 404 }
      )
    }

    // Biến đổi danh sách thẻ và tính tiến độ SRS
    let masteredCount = 0
    let learningCount = 0
    let newCount = 0

    const formattedCards = set.cards.map((card) => {
      const srs = card.srsData[0] || null
      if (!srs || srs.status === "New") {
        newCount++
      } else if (srs.status === "Mastered") {
        masteredCount++
      } else {
        learningCount++
      }

      return {
        id: card.id,
        studySetId: card.studySetId,
        term: card.term,
        reading: card.reading,
        definition: card.definition,
        example: card.example,
        exampleTranslation: card.exampleTranslation,
        imageUrl: card.imageUrl,
        audioUrl: card.audioUrl,
        note: card.note,
        jlptLevel: card.jlptLevel,
        wordType: card.wordType,
        radicals: card.radicals,
        strokeCount: card.strokeCount,
        onReading: card.onReading,
        kunReading: card.kunReading,
        compounds: card.compounds,
        order: card.order,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        tags: card.cardTags.map((ct) => ct.tag),
        srsData: srs,
      }
    })

    const totalCards = set.cardCount
    const percentage =
      totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0

    const lastStudiedAt = set.studySessions[0]?.startedAt || null

    return NextResponse.json({
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
      cards: formattedCards,
      lastStudiedAt,
      progress: {
        mastered: masteredCount,
        learning: learningCount,
        new: newCount,
        percentage,
      },
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/sets/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy chi tiết bộ thẻ." },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/sets/[id] — Cập nhật thông tin bộ thẻ
 */
export async function PATCH(req: Request, { params }: RouteProps) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const validation = UpdateSetSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu cập nhật bộ thẻ không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    // Kiểm tra bộ thẻ tồn tại và thuộc quyền sở hữu
    const existingSet = await prisma.studySet.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingSet) {
      return NextResponse.json(
        { error: "Không tìm thấy bộ thẻ hoặc bạn không có quyền chỉnh sửa." },
        { status: 404 }
      )
    }

    const { name, description, sourceLanguage, targetLanguage, folderId } =
      validation.data

    // Nếu cập nhật folderId, kiểm tra folder có hợp lệ không
    if (folderId !== undefined && folderId !== null) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId: user.id },
      })

      if (!folder) {
        return NextResponse.json(
          {
            error:
              "Thư mục chỉ định không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
          },
          { status: 404 }
        )
      }
    }

    const updatedSet = await prisma.studySet.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(sourceLanguage !== undefined && { sourceLanguage }),
        ...(targetLanguage !== undefined && { targetLanguage }),
        ...(folderId !== undefined && { folderId }),
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

    return NextResponse.json(updatedSet)
  } catch (error) {
    console.error("❌ Lỗi PATCH /api/sets/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi cập nhật bộ thẻ." },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sets/[id] — Xoá bộ thẻ (tự động cascade xoá các thẻ bên trong)
 */
export async function DELETE(req: Request, { params }: RouteProps) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const { id } = await params

    const existingSet = await prisma.studySet.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingSet) {
      return NextResponse.json(
        { error: "Không tìm thấy bộ thẻ hoặc bạn không có quyền xoá." },
        { status: 404 }
      )
    }

    await prisma.studySet.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Đã xóa bộ thẻ thành công.",
    })
  } catch (error) {
    console.error("❌ Lỗi DELETE /api/sets/[id]:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi xóa bộ thẻ." },
      { status: 500 }
    )
  }
}
