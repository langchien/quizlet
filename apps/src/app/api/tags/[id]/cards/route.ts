import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

interface RouteProps {
  params: Promise<{ id: string }>
}

/**
 * GET /api/tags/[id]/cards — Lấy tất cả thẻ gắn nhãn này xuyên suốt các bộ thẻ
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

    // Kiểm tra tag tồn tại và thuộc quyền sở hữu
    const tag = await prisma.tag.findFirst({
      where: { id, userId: user.id },
    })

    if (!tag) {
      return NextResponse.json(
        { error: "Không tìm thấy nhãn hoặc bạn không có quyền truy cập." },
        { status: 404 }
      )
    }

    // Lấy tất cả CardTag tương ứng
    const cardTags = await prisma.cardTag.findMany({
      where: {
        tagId: id,
        card: {
          studySet: {
            userId: user.id,
          },
        },
      },
      include: {
        card: {
          include: {
            studySet: {
              select: {
                id: true,
                name: true,
              },
            },
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
      },
    })

    const cards = cardTags.map((ct) => {
      const card = ct.card
      const srs = card.srsData[0] || null

      return {
        id: card.id,
        studySetId: card.studySetId,
        studySet: card.studySet,
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
        tags: card.cardTags.map((t) => t.tag),
        srsData: srs,
      }
    })

    return NextResponse.json({
      tag: {
        id: tag.id,
        name: tag.name,
        color: tag.color,
      },
      total: cards.length,
      cards,
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/tags/[id]/cards:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy danh sách thẻ theo nhãn." },
      { status: 500 }
    )
  }
}
