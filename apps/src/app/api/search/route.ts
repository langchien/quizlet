import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

/**
 * GET /api/search?q=... — Tìm kiếm toàn cục trên bộ thẻ, thẻ học, thư mục và nhãn
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

    if (!q) {
      return NextResponse.json({
        query: "",
        results: {
          sets: [],
          cards: [],
          folders: [],
          tags: [],
        },
        total: 0,
      })
    }

    // Thực hiện tìm kiếm song song
    const [sets, cards, folders, tags] = await Promise.all([
      // 1. Tìm trong StudySets
      prisma.studySet.findMany({
        where: {
          userId: user.id,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: limit,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          cardCount: true,
          updatedAt: true,
          folder: {
            select: { id: true, name: true },
          },
        },
      }),

      // 2. Tìm trong Cards
      prisma.card.findMany({
        where: {
          studySet: {
            userId: user.id,
          },
          OR: [
            { term: { contains: q, mode: "insensitive" } },
            { reading: { contains: q, mode: "insensitive" } },
            { definition: { contains: q, mode: "insensitive" } },
            { example: { contains: q, mode: "insensitive" } },
            { exampleTranslation: { contains: q, mode: "insensitive" } },
            { note: { contains: q, mode: "insensitive" } },
            { onReading: { contains: q, mode: "insensitive" } },
            { kunReading: { contains: q, mode: "insensitive" } },
            { compounds: { contains: q, mode: "insensitive" } },
          ],
        },
        take: limit,
        orderBy: { updatedAt: "desc" },
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
                select: { id: true, name: true, color: true },
              },
            },
          },
        },
      }),

      // 3. Tìm trong Folders
      prisma.folder.findMany({
        where: {
          userId: user.id,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: limit,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          _count: {
            select: { studySets: true, children: true },
          },
        },
      }),

      // 4. Tìm trong Tags
      prisma.tag.findMany({
        where: {
          userId: user.id,
          name: { contains: q, mode: "insensitive" },
        },
        take: limit,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { cardTags: true },
          },
        },
      }),
    ])

    const formattedCards = cards.map((c) => ({
      id: c.id,
      term: c.term,
      reading: c.reading,
      definition: c.definition,
      studySetId: c.studySetId,
      studySetName: c.studySet.name,
      jlptLevel: c.jlptLevel,
      wordType: c.wordType,
      tags: c.cardTags.map((ct) => ct.tag),
    }))

    const formattedTags = tags.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      cardCount: t._count.cardTags,
    }))

    const total =
      sets.length +
      formattedCards.length +
      folders.length +
      formattedTags.length

    return NextResponse.json({
      query: q,
      results: {
        sets,
        cards: formattedCards,
        folders,
        tags: formattedTags,
      },
      total,
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/search:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ khi tìm kiếm toàn cục." },
      { status: 500 }
    )
  }
}
