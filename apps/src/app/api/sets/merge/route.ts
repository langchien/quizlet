import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { MergeSetsSchema } from "@/schemas/set"

/**
 * POST /api/sets/merge — Gộp nhiều bộ thẻ vào một bộ thẻ đích
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
    const validation = MergeSetsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu gộp bộ thẻ không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { targetSetId, sourceSetIds, deleteSources } = validation.data

    // Không cho phép gộp bộ thẻ đích vào chính nó
    if (sourceSetIds.includes(targetSetId)) {
      return NextResponse.json(
        { error: "Bộ thẻ nguồn không được trùng với bộ thẻ đích cần gộp." },
        { status: 400 }
      )
    }

    // Kiểm tra bộ thẻ đích
    const targetSet = await prisma.studySet.findFirst({
      where: { id: targetSetId, userId: user.id },
      include: {
        cards: {
          select: { id: true, order: true },
          orderBy: { order: "desc" },
          take: 1,
        },
      },
    })

    if (!targetSet) {
      return NextResponse.json(
        {
          error:
            "Bộ thẻ đích không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
        },
        { status: 404 }
      )
    }

    // Kiểm tra các bộ thẻ nguồn
    const sourceSets = await prisma.studySet.findMany({
      where: {
        id: { in: sourceSetIds },
        userId: user.id,
      },
      include: {
        cards: {
          orderBy: { order: "asc" },
          include: {
            cardTags: true,
          },
        },
      },
    })

    if (sourceSets.length !== sourceSetIds.length) {
      return NextResponse.json(
        {
          error:
            "Một hoặc nhiều bộ thẻ nguồn không tồn tại hoặc không thuộc về bạn.",
        },
        { status: 404 }
      )
    }

    // Thu thập toàn bộ thẻ từ các nguồn
    const allSourceCards = sourceSets.flatMap((s) => s.cards)

    // Xác định thứ tự bắt đầu cho các thẻ mới thêm vào bộ đích
    const startOrder =
      targetSet.cards.length > 0 ? (targetSet.cards[0]?.order ?? 0) + 1 : 0

    // Thực hiện gộp trong Transaction
    await prisma.$transaction(async (tx) => {
      if (deleteSources) {
        // Cách 1: Chuyển trực tiếp các thẻ sang bộ đích và xóa các bộ nguồn
        let currentOrder = startOrder
        for (const card of allSourceCards) {
          await tx.card.update({
            where: { id: card.id },
            data: {
              studySetId: targetSetId,
              order: currentOrder++,
            },
          })
        }

        // Xóa các bộ thẻ nguồn (lúc này các thẻ đã được chuyển sang bộ đích)
        await tx.studySet.deleteMany({
          where: {
            id: { in: sourceSetIds },
            userId: user.id,
          },
        })
      } else {
        // Cách 2: Sao chép các thẻ sang bộ đích, giữ nguyên các bộ nguồn
        let currentOrder = startOrder
        for (const card of allSourceCards) {
          const newCard = await tx.card.create({
            data: {
              studySetId: targetSetId,
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
              order: currentOrder++,
            },
          })

          // Sao chép tag liên kết nếu có
          if (card.cardTags && card.cardTags.length > 0) {
            await tx.cardTag.createMany({
              data: card.cardTags.map((ct) => ({
                cardId: newCard.id,
                tagId: ct.tagId,
              })),
            })
          }
        }
      }

      // Đếm lại tổng số thẻ thực tế trong bộ đích và cập nhật cardCount
      const totalCount = await tx.card.count({
        where: { studySetId: targetSetId },
      })

      await tx.studySet.update({
        where: { id: targetSetId },
        data: { cardCount: totalCount },
      })
    })

    // Lấy lại bộ thẻ sau khi đã gộp thành công
    const mergedResult = await prisma.studySet.findUnique({
      where: { id: targetSetId },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Đã gộp thành công ${allSourceCards.length} thẻ vào bộ "${mergedResult?.name}".`,
      data: mergedResult,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/sets/merge:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi gộp các bộ thẻ." },
      { status: 500 }
    )
  }
}
