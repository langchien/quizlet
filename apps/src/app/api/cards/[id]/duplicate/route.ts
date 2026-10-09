import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

interface RouteProps {
  params: Promise<{ id: string }>
}

/**
 * POST /api/cards/[id]/duplicate — Nhân bản thẻ từ vựng trong bộ thẻ
 */
export async function POST(req: Request, { params }: RouteProps) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      )
    }

    const { id } = await params

    const originalCard = await prisma.card.findFirst({
      where: {
        id,
        studySet: { userId: user.id },
      },
      include: {
        cardTags: true,
      },
    })

    if (!originalCard) {
      return NextResponse.json(
        {
          error:
            "Không tìm thấy thẻ cần nhân bản hoặc bạn không có quyền truy cập.",
        },
        { status: 404 }
      )
    }

    // Nhân bản thẻ trong Transaction
    const duplicatedCard = await prisma.$transaction(async (tx) => {
      // 1. Tạo thẻ mới với order tiếp theo
      const newCard = await tx.card.create({
        data: {
          studySetId: originalCard.studySetId,
          term: originalCard.term,
          reading: originalCard.reading,
          definition: originalCard.definition,
          example: originalCard.example,
          exampleTranslation: originalCard.exampleTranslation,
          imageUrl: originalCard.imageUrl,
          audioUrl: originalCard.audioUrl,
          note: originalCard.note,
          jlptLevel: originalCard.jlptLevel,
          wordType: originalCard.wordType,
          radicals: originalCard.radicals,
          strokeCount: originalCard.strokeCount,
          onReading: originalCard.onReading,
          kunReading: originalCard.kunReading,
          compounds: originalCard.compounds,
          order: originalCard.order + 1,
        },
      })

      // 2. Sao chép các tag liên kết
      if (originalCard.cardTags.length > 0) {
        await tx.cardTag.createMany({
          data: originalCard.cardTags.map((ct) => ({
            cardId: newCard.id,
            tagId: ct.tagId,
          })),
        })
      }

      // 3. Khởi tạo SRS ban đầu cho thẻ mới
      await tx.sRSData.create({
        data: {
          cardId: newCard.id,
          userId: user.id,
          status: "New",
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: new Date(),
        },
      })

      // 4. Cập nhật cardCount của bộ thẻ
      const count = await tx.card.count({
        where: { studySetId: originalCard.studySetId },
      })
      await tx.studySet.update({
        where: { id: originalCard.studySetId },
        data: { cardCount: count },
      })

      return newCard
    })

    // Lấy lại thẻ đầy đủ thông tin
    const fullCard = await prisma.card.findUnique({
      where: { id: duplicatedCard.id },
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
    })

    const formattedResult = {
      id: fullCard!.id,
      studySetId: fullCard!.studySetId,
      term: fullCard!.term,
      reading: fullCard!.reading,
      definition: fullCard!.definition,
      example: fullCard!.example,
      exampleTranslation: fullCard!.exampleTranslation,
      imageUrl: fullCard!.imageUrl,
      audioUrl: fullCard!.audioUrl,
      note: fullCard!.note,
      jlptLevel: fullCard!.jlptLevel,
      wordType: fullCard!.wordType,
      radicals: fullCard!.radicals,
      strokeCount: fullCard!.strokeCount,
      onReading: fullCard!.onReading,
      kunReading: fullCard!.kunReading,
      compounds: fullCard!.compounds,
      order: fullCard!.order,
      createdAt: fullCard!.createdAt,
      updatedAt: fullCard!.updatedAt,
      tags: fullCard!.cardTags.map((ct) => ct.tag),
      srsData: fullCard!.srsData[0] || null,
    }

    return NextResponse.json(formattedResult, { status: 201 })
  } catch (error) {
    console.error("❌ Lỗi POST /api/cards/[id]/duplicate:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi nhân bản thẻ." },
      { status: 500 }
    )
  }
}
