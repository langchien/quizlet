import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

/**
 * GET /api/export/all — Xuất toàn bộ danh sách bộ thẻ của người dùng ra file JSON
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thực hiện chức năng này." },
        { status: 401 }
      )
    }

    const sets = await prisma.studySet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      include: {
        folder: {
          select: { id: true, name: true },
        },
        cards: {
          orderBy: { order: "asc" },
          include: {
            cardTags: {
              include: { tag: true },
            },
            srsData: {
              where: { userId: user.id },
            },
          },
        },
      },
    })

    const exportData = {
      app: "NihoMemo",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
      },
      totalSets: sets.length,
      studySets: sets.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        sourceLanguage: s.sourceLanguage,
        targetLanguage: s.targetLanguage,
        folderName: s.folder?.name || null,
        cardCount: s.cardCount,
        cards: s.cards.map((c) => ({
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
          tags: c.cardTags.map((ct) => ct.tag.name),
          srsStatus: c.srsData[0]?.status || "New",
        })),
      })),
    }

    const filename = `nihomemo-all-sets-${new Date().toISOString().slice(0, 10)}.json`

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/export/all:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xuất toàn bộ bộ thẻ." },
      { status: 500 }
    )
  }
}
