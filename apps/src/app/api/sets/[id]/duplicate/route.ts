import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { DuplicateSetSchema } from "@/schemas/set"

interface RouteProps {
  params: Promise<{ id: string }>
}

/**
 * POST /api/sets/[id]/duplicate — Nhân bản bộ thẻ kèm toàn bộ các thẻ từ vựng bên trong
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
    let body = {}
    try {
      body = await req.json()
    } catch {
      // Body có thể để trống
    }

    const validation = DuplicateSetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu nhân bản không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    // Tìm bộ thẻ gốc
    const originalSet = await prisma.studySet.findFirst({
      where: { id, userId: user.id },
      include: {
        cards: {
          orderBy: { order: "asc" },
          include: {
            cardTags: true,
          },
        },
      },
    })

    if (!originalSet) {
      return NextResponse.json(
        { error: "Không tìm thấy bộ thẻ cần nhân bản." },
        { status: 404 }
      )
    }

    const newName =
      validation.data.name?.trim() || `${originalSet.name} (Bản sao)`

    // Tiến hành nhân bản trong Transaction
    const duplicatedSet = await prisma.$transaction(async (tx) => {
      // 1. Tạo bộ thẻ mới
      const newSet = await tx.studySet.create({
        data: {
          name: newName,
          description: originalSet.description,
          sourceLanguage: originalSet.sourceLanguage,
          targetLanguage: originalSet.targetLanguage,
          folderId: originalSet.folderId,
          userId: user.id,
          cardCount: originalSet.cards.length,
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

      // 2. Nhân bản từng thẻ và gán tag tương ứng
      for (const oldCard of originalSet.cards) {
        const newCard = await tx.card.create({
          data: {
            studySetId: newSet.id,
            term: oldCard.term,
            reading: oldCard.reading,
            definition: oldCard.definition,
            example: oldCard.example,
            exampleTranslation: oldCard.exampleTranslation,
            imageUrl: oldCard.imageUrl,
            audioUrl: oldCard.audioUrl,
            note: oldCard.note,
            jlptLevel: oldCard.jlptLevel,
            wordType: oldCard.wordType,
            radicals: oldCard.radicals,
            strokeCount: oldCard.strokeCount,
            onReading: oldCard.onReading,
            kunReading: oldCard.kunReading,
            compounds: oldCard.compounds,
            order: oldCard.order,
          },
        })

        // Sao chép liên kết nhãn (tags) nếu có
        if (oldCard.cardTags && oldCard.cardTags.length > 0) {
          await tx.cardTag.createMany({
            data: oldCard.cardTags.map((ct) => ({
              cardId: newCard.id,
              tagId: ct.tagId,
            })),
          })
        }
      }

      return newSet
    })

    return NextResponse.json(
      {
        ...duplicatedSet,
        progress: {
          mastered: 0,
          learning: 0,
          new: duplicatedSet.cardCount,
          percentage: 0,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Lỗi POST /api/sets/[id]/duplicate:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi nhân bản bộ thẻ." },
      { status: 500 }
    )
  }
}
