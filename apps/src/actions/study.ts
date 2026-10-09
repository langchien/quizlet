"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import {
  StartSessionSchema,
  AnswerQuestionSchema,
  EndSessionSchema,
  type StartSessionBody,
  type AnswerQuestionBody,
  type EndSessionBody,
} from "@/schemas/session"
import {
  getCardsForStudySession,
  getMistakeCards,
  type StudyCardItem,
} from "@/lib/dal/study"
import { processSRSReview } from "@/lib/srs"
import type { ActionResponse } from "./sets"
import type {
  StudySession,
  SRSData,
  StudyMode,
  JLPTLevel,
} from "@/generated/prisma/client"

export interface StartSessionResult {
  session: StudySession
  cards: StudyCardItem[]
  total: number
}

export interface AnswerCardResult {
  srsData: SRSData
  session: StudySession | null
}

/**
 * Server Action: Bắt đầu một phiên học tập mới (Flashcard, Learn, Quiz, Write, Match, Listen)
 */
export async function startStudySessionAction(
  input: StartSessionBody
): Promise<ActionResponse<StartSessionResult>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để bắt đầu phiên học.",
      }
    }

    const validation = StartSessionSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          "Dữ liệu bắt đầu phiên học không hợp lệ.",
      }
    }

    const { studySetId, mode } = validation.data

    if (studySetId) {
      const set = await prisma.studySet.findFirst({
        where: { id: studySetId, userId: user.id },
      })
      if (!set) {
        return {
          success: false,
          error: "Bộ thẻ không tồn tại hoặc không thuộc quyền sở hữu của bạn.",
        }
      }
    }

    const cards = await getCardsForStudySession(user.id, validation.data)

    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        studySetId: studySetId || null,
        mode,
        startedAt: new Date(),
        totalCards: cards.length,
        correctCards: 0,
        incorrectCards: 0,
        score: 0,
      },
    })

    return {
      success: true,
      data: {
        session,
        cards,
        total: cards.length,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi startStudySessionAction:", error)
    return { success: false, error: "Đã xảy ra lỗi khi bắt đầu phiên học." }
  }
}

/**
 * Server Action: Ghi nhận kết quả trả lời một câu hỏi và cập nhật SRS
 */
export async function answerCardAction(
  input: AnswerQuestionBody
): Promise<ActionResponse<AnswerCardResult>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để thực hiện thao tác này.",
      }
    }

    const validation = AnswerQuestionSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          "Dữ liệu câu trả lời không hợp lệ.",
      }
    }

    const { sessionId, cardId, isCorrect, timeTaken } = validation.data

    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true },
    })

    if (!card) {
      return { success: false, error: "Thẻ học tập không tồn tại." }
    }

    const updatedSRS = await processSRSReview({
      userId: user.id,
      cardId,
      isCorrect,
      timeTaken: timeTaken || 0,
    })

    let updatedSession: StudySession | null = null
    if (sessionId) {
      const session = await prisma.studySession.findFirst({
        where: { id: sessionId, userId: user.id },
      })

      if (session) {
        const newCorrect = session.correctCards + (isCorrect ? 1 : 0)
        const newIncorrect = session.incorrectCards + (isCorrect ? 0 : 1)
        const answeredTotal = newCorrect + newIncorrect
        const score =
          answeredTotal > 0 ? Math.round((newCorrect / answeredTotal) * 100) : 0

        updatedSession = await prisma.studySession.update({
          where: { id: sessionId },
          data: {
            correctCards: newCorrect,
            incorrectCards: newIncorrect,
            duration: { increment: timeTaken || 0 },
            score,
          },
        })
      }
    }

    return {
      success: true,
      data: {
        srsData: updatedSRS,
        session: updatedSession,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi answerCardAction:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi máy chủ khi lưu kết quả câu trả lời.",
    }
  }
}

/**
 * Server Action: Kết thúc phiên học và lưu tổng kết
 */
export async function endStudySessionAction(
  input: EndSessionBody
): Promise<ActionResponse<StudySession>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để kết thúc phiên học.",
      }
    }

    const validation = EndSessionSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ||
          "Dữ liệu kết thúc phiên học không hợp lệ.",
      }
    }

    const {
      sessionId,
      studySetId,
      mode,
      duration,
      totalCards,
      correctCards,
      incorrectCards,
      score,
    } = validation.data

    let session: StudySession | null = null

    if (sessionId) {
      const existing = await prisma.studySession.findFirst({
        where: { id: sessionId, userId: user.id },
      })

      if (existing) {
        session = await prisma.studySession.update({
          where: { id: sessionId },
          data: {
            endedAt: new Date(),
            duration,
            totalCards,
            correctCards,
            incorrectCards,
            score,
          },
        })
      }
    }

    if (!session) {
      session = await prisma.studySession.create({
        data: {
          userId: user.id,
          studySetId: studySetId || null,
          mode,
          startedAt: new Date(Date.now() - duration * 1000),
          endedAt: new Date(),
          duration,
          totalCards,
          correctCards,
          incorrectCards,
          score,
        },
      })
    }

    revalidatePath("/dashboard")
    revalidatePath("/stats")

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error("❌ Lỗi endStudySessionAction:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi máy chủ khi kết thúc phiên học.",
    }
  }
}

/**
 * Server Action: Bắt đầu phiên ôn tập thẻ sai
 */
export async function startReviewMistakesAction(input: {
  studySetId?: string | null
  mode?: StudyMode
  limit?: number
  shuffle?: boolean
}): Promise<ActionResponse<StartSessionResult>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để ôn tập lỗi sai." }
    }

    const { studySetId, mode = "Flashcard", limit, shuffle = true } = input

    const mistakeItems = await prisma.sRSData.findMany({
      where: {
        userId: user.id,
        incorrectCount: { gt: 0 },
        ...(studySetId ? { card: { studySetId } } : {}),
      },
      orderBy: { incorrectCount: "desc" },
      include: {
        card: {
          include: {
            studySet: { select: { id: true, name: true } },
            cardTags: {
              include: {
                tag: { select: { id: true, name: true, color: true } },
              },
            },
          },
        },
      },
    })

    let cards: StudyCardItem[] = mistakeItems.map((srs) => ({
      id: srs.card.id,
      studySetId: srs.card.studySetId,
      term: srs.card.term,
      reading: srs.card.reading,
      definition: srs.card.definition,
      example: srs.card.example,
      exampleTranslation: srs.card.exampleTranslation,
      imageUrl: srs.card.imageUrl,
      audioUrl: srs.card.audioUrl,
      note: srs.card.note,
      jlptLevel: srs.card.jlptLevel,
      wordType: srs.card.wordType,
      radicals: srs.card.radicals,
      strokeCount: srs.card.strokeCount,
      onReading: srs.card.onReading,
      kunReading: srs.card.kunReading,
      compounds: srs.card.compounds,
      order: srs.card.order,
      tags: srs.card.cardTags.map((ct) => ct.tag),
      srsData: {
        id: srs.id,
        status: srs.status,
        easeFactor: srs.easeFactor,
        interval: srs.interval,
        repetitions: srs.repetitions,
        correctCount: srs.correctCount,
        incorrectCount: srs.incorrectCount,
        nextReviewDate: srs.nextReviewDate,
      },
      studySet: srs.card.studySet,
    }))

    if (shuffle) {
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[cards[i], cards[j]] = [cards[j], cards[i]]
      }
    }

    if (limit && limit > 0) {
      cards = cards.slice(0, limit)
    }

    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        studySetId: studySetId || null,
        mode,
        startedAt: new Date(),
        totalCards: cards.length,
        correctCards: 0,
        incorrectCards: 0,
        score: 0,
      },
    })

    return {
      success: true,
      data: {
        session,
        cards,
        total: cards.length,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi startReviewMistakesAction:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi máy chủ khi bắt đầu ôn tập thẻ sai.",
    }
  }
}

/**
 * Server Action: Lấy danh sách thẻ sai phục vụ trang Mistakes Pool
 */
export async function getMistakeCardsAction(options: {
  studySetId?: string | null
  jlpt?: JLPTLevel | null
  sortBy?: string
}) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Vui lòng đăng nhập để xem danh sách lỗi sai.",
      }
    }

    const items = await getMistakeCards(user.id, options)
    return { success: true, data: items }
  } catch (error) {
    console.error("❌ Lỗi getMistakeCardsAction:", error)
    return { success: false, error: "Đã xảy ra lỗi khi tải danh sách lỗi sai." }
  }
}
