import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { StartSessionSchema } from "@/schemas/session"
import type { Prisma } from "@/generated/prisma/client"

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để bắt đầu phiên học." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = StartSessionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu bắt đầu phiên học không hợp lệ.",
          details: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const { studySetId, mode, shuffle, filterByStatus, filterByTags, limit } =
      validation.data

    // 1. Tạo điều kiện truy vấn Card
    const cardWhere: Prisma.CardWhereInput = {}

    if (studySetId) {
      // Kiểm tra quyền sở hữu bộ thẻ
      const set = await prisma.studySet.findFirst({
        where: { id: studySetId, userId: user.id },
      })

      if (!set) {
        return NextResponse.json(
          {
            error:
              "Bộ thẻ không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
          },
          { status: 404 }
        )
      }

      cardWhere.studySetId = studySetId
    } else {
      // Lấy tất cả thẻ của người dùng
      cardWhere.studySet = {
        userId: user.id,
      }
    }

    // Lọc theo Tags nếu có
    if (filterByTags && filterByTags.length > 0) {
      cardWhere.cardTags = {
        some: {
          tagId: {
            in: filterByTags,
          },
        },
      }
    }

    // Lấy danh sách thẻ kèm thông tin chi tiết
    const rawCards = await prisma.card.findMany({
      where: cardWhere,
      orderBy: { order: "asc" },
      include: {
        cardTags: {
          include: {
            tag: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        srsData: {
          where: { userId: user.id },
          select: {
            id: true,
            status: true,
            easeFactor: true,
            interval: true,
            repetitions: true,
            nextReviewDate: true,
            correctCount: true,
            incorrectCount: true,
          },
        },
        studySet: {
          select: { id: true, name: true },
        },
      },
    })

    // 2. Lọc theo SRS Status
    let filteredCards = rawCards.map((c) => ({
      id: c.id,
      studySetId: c.studySetId,
      term: c.term,
      reading: c.reading,
      definition: c.definition,
      example: c.example,
      exampleTranslation: c.exampleTranslation,
      imageUrl: c.imageUrl,
      audioUrl: c.audioUrl,
      note: c.note,
      jlptLevel: c.jlptLevel,
      wordType: c.wordType,
      radicals: c.radicals,
      strokeCount: c.strokeCount,
      onReading: c.onReading,
      kunReading: c.kunReading,
      compounds: c.compounds,
      order: c.order,
      tags: c.cardTags.map((ct) => ct.tag),
      srsData: c.srsData[0] || {
        status: "New" as const,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        correctCount: 0,
        incorrectCount: 0,
      },
      studySet: c.studySet,
    }))

    if (filterByStatus && filterByStatus !== "All") {
      filteredCards = filteredCards.filter(
        (c) => c.srsData.status === filterByStatus
      )
    }

    // 3. Shuffle nếu được yêu cầu
    if (shuffle) {
      for (let i = filteredCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[filteredCards[i], filteredCards[j]] = [
          filteredCards[j],
          filteredCards[i],
        ]
      }
    }

    // 4. Giới hạn số lượng thẻ (limit)
    if (limit && limit > 0) {
      filteredCards = filteredCards.slice(0, limit)
    }

    // 5. Tạo bản ghi StudySession mới
    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        studySetId: studySetId || null,
        mode,
        startedAt: new Date(),
        totalCards: filteredCards.length,
        correctCards: 0,
        incorrectCards: 0,
        score: 0,
      },
    })

    return NextResponse.json({
      session,
      cards: filteredCards,
      total: filteredCards.length,
    })
  } catch (error) {
    console.error("❌ Lỗi POST /api/study/start:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi bắt đầu phiên học." },
      { status: 500 }
    )
  }
}
