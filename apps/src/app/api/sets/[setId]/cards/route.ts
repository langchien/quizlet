import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { CreateCardSchema } from "@/schemas/card"
import type {
  Prisma,
  JLPTLevel,
  WordType,
  CardStatus,
} from "@/generated/prisma/client"

interface RouteProps {
  params: Promise<{ setId: string }>
}

/**
 * GET /api/sets/[setId]/cards — Danh sách thẻ học trong bộ thẻ
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

    const { setId } = await params

    // Kiểm tra bộ thẻ thuộc quyền sở hữu của user
    const studySet = await prisma.studySet.findFirst({
      where: { id: setId, userId: user.id },
    })

    if (!studySet) {
      return NextResponse.json(
        { error: "Không tìm thấy bộ thẻ hoặc bạn không có quyền truy cập." },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")?.trim() || ""
    const jlptLevel = searchParams.get("jlptLevel")
    const wordType = searchParams.get("wordType")
    const tagId = searchParams.get("tagId")
    const srsStatus = searchParams.get("srsStatus")

    const where: Prisma.CardWhereInput = {
      studySetId: setId,
    }

    if (search) {
      where.OR = [
        { term: { contains: search, mode: "insensitive" } },
        { reading: { contains: search, mode: "insensitive" } },
        { definition: { contains: search, mode: "insensitive" } },
        { example: { contains: search, mode: "insensitive" } },
      ]
    }

    if (jlptLevel) {
      where.jlptLevel = jlptLevel as JLPTLevel
    }

    if (wordType) {
      where.wordType = wordType as WordType
    }

    if (tagId) {
      where.cardTags = {
        some: { tagId },
      }
    }

    if (srsStatus) {
      where.srsData = {
        some: {
          userId: user.id,
          status: srsStatus as CardStatus,
        },
      }
    }

    const cards = await prisma.card.findMany({
      where,
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
    })

    const formattedCards = cards.map((card) => ({
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
      srsData: card.srsData[0] || null,
    }))

    return NextResponse.json({
      items: formattedCards,
      total: formattedCards.length,
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/sets/[setId]/cards:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi lấy danh sách thẻ." },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sets/[setId]/cards — Thêm thẻ mới vào bộ thẻ
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

    const { setId } = await params

    // Kiểm tra bộ thẻ thuộc quyền sở hữu của user
    const studySet = await prisma.studySet.findFirst({
      where: { id: setId, userId: user.id },
      include: {
        cards: {
          select: { order: true },
          orderBy: { order: "desc" },
          take: 1,
        },
      },
    })

    if (!studySet) {
      return NextResponse.json(
        { error: "Bộ thẻ không tồn tại hoặc bạn không có quyền thêm thẻ." },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validation = CreateCardSchema.safeParse({
      ...body,
      studySetId: setId,
    })

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu thẻ từ vựng không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const data = validation.data
    const nextOrder =
      data.order > 0
        ? data.order
        : studySet.cards.length > 0
          ? (studySet.cards[0]?.order ?? 0) + 1
          : 0

    // Kiểm tra tagIds hợp lệ thuộc về user nếu có
    const tagIds = data.tagIds || []
    if (tagIds.length > 0) {
      const existingTagsCount = await prisma.tag.count({
        where: {
          id: { in: tagIds },
          userId: user.id,
        },
      })
      if (existingTagsCount !== tagIds.length) {
        return NextResponse.json(
          {
            error:
              "Một hoặc nhiều nhãn (tags) không tồn tại hoặc không thuộc quyền của bạn.",
          },
          { status: 400 }
        )
      }
    }

    // Tạo thẻ, liên kết tags, tạo SRS ban đầu và cập nhật cardCount trong Transaction
    const newCard = await prisma.$transaction(async (tx) => {
      // 1. Tạo Card
      const card = await tx.card.create({
        data: {
          studySetId: setId,
          term: data.term,
          reading: data.reading,
          definition: data.definition,
          example: data.example || null,
          exampleTranslation: data.exampleTranslation || null,
          imageUrl: data.imageUrl || null,
          audioUrl: data.audioUrl || null,
          note: data.note || null,
          jlptLevel: data.jlptLevel || null,
          wordType: data.wordType || null,
          radicals: data.radicals || null,
          strokeCount: data.strokeCount || null,
          onReading: data.onReading || null,
          kunReading: data.kunReading || null,
          compounds: data.compounds || null,
          order: nextOrder,
        },
      })

      // 2. Gán Tags
      if (tagIds.length > 0) {
        await tx.cardTag.createMany({
          data: tagIds.map((tagId) => ({
            cardId: card.id,
            tagId,
          })),
        })
      }

      // 3. Khởi tạo dữ liệu SRS ban đầu
      const initialSRS = await tx.sRSData.create({
        data: {
          cardId: card.id,
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
        where: { studySetId: setId },
      })
      await tx.studySet.update({
        where: { id: setId },
        data: { cardCount: count },
      })

      return {
        ...card,
        srsData: initialSRS,
      }
    })

    // Lấy lại card kèm tags đầy đủ
    const fullCard = await prisma.card.findUnique({
      where: { id: newCard.id },
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
    console.error("❌ Lỗi POST /api/sets/[setId]/cards:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi thêm thẻ mới." },
      { status: 500 }
    )
  }
}
