import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

/**
 * GET /api/export/backup — Tạo và tải bản sao lưu toàn bộ dữ liệu người dùng (Full Backup)
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

    // Lấy toàn bộ dữ liệu liên quan của user
    const [folders, studySets, tags, studySessions, dailyStats, userGoal] =
      await Promise.all([
        prisma.folder.findMany({
          where: { userId: user.id },
          orderBy: { order: "asc" },
        }),
        prisma.studySet.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" },
          include: {
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
        }),
        prisma.tag.findMany({
          where: { userId: user.id },
        }),
        prisma.studySession.findMany({
          where: { userId: user.id },
          orderBy: { startedAt: "desc" },
        }),
        prisma.dailyStats.findMany({
          where: { userId: user.id },
          orderBy: { date: "asc" },
        }),
        prisma.userGoal.findUnique({
          where: { userId: user.id },
        }),
      ])

    const backupData = {
      app: "NihoMemo",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        settings: user.settings,
      },
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        parentId: f.parentId,
        order: f.order,
      })),
      studySets: studySets.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        sourceLanguage: s.sourceLanguage,
        targetLanguage: s.targetLanguage,
        folderId: s.folderId,
        cardCount: s.cardCount,
        cards: s.cards.map((c) => ({
          id: c.id,
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
          srsData: c.srsData[0]
            ? {
                status: c.srsData[0].status,
                easeFactor: c.srsData[0].easeFactor,
                interval: c.srsData[0].interval,
                repetitions: c.srsData[0].repetitions,
                nextReviewDate: c.srsData[0].nextReviewDate,
                lastReviewDate: c.srsData[0].lastReviewDate,
                correctCount: c.srsData[0].correctCount,
                incorrectCount: c.srsData[0].incorrectCount,
              }
            : null,
        })),
      })),
      tags: tags.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
      })),
      studySessions: studySessions.map((ss) => ({
        studySetId: ss.studySetId,
        mode: ss.mode,
        startedAt: ss.startedAt,
        endedAt: ss.endedAt,
        duration: ss.duration,
        totalCards: ss.totalCards,
        correctCards: ss.correctCards,
        incorrectCards: ss.incorrectCards,
        score: ss.score,
      })),
      dailyStats: dailyStats.map((ds) => ({
        date: ds.date,
        cardsStudied: ds.cardsStudied,
        cardsCorrect: ds.cardsCorrect,
        cardsIncorrect: ds.cardsIncorrect,
        timeSpent: ds.timeSpent,
        newCardsSeen: ds.newCardsSeen,
        reviewCards: ds.reviewCards,
        streak: ds.streak,
      })),
      userGoal: userGoal
        ? {
            dailyCardTarget: userGoal.dailyCardTarget,
            dailyTimeTarget: userGoal.dailyTimeTarget,
            currentStreak: userGoal.currentStreak,
            longestStreak: userGoal.longestStreak,
            lastStudyDate: userGoal.lastStudyDate,
          }
        : null,
    }

    const filename = `nihomemo-full-backup-${new Date().toISOString().slice(0, 10)}.json`

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("❌ Lỗi GET /api/export/backup:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tạo bản sao lưu toàn bộ." },
      { status: 500 }
    )
  }
}
