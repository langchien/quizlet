import { prisma } from "@/lib/prisma"
import {
  calculateAutoSRS,
  calculateSimpleSRS,
  calculateSM2,
  type CurrentSRSState,
  type SRSCalculationResult,
} from "./algorithms"

export * from "./algorithms"

/**
 * Lấy chuỗi ngày YYYY-MM-DD theo giờ địa phương
 */
export function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Cập nhật chuỗi Streak và mục tiêu ngày của User
 */
export async function updateUserGoalAndStreak(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const goal = await prisma.userGoal.findUnique({
    where: { userId },
  })

  if (!goal) {
    await prisma.userGoal.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastStudyDate: new Date(),
      },
    })
    return
  }

  let currentStreak = goal.currentStreak
  let longestStreak = goal.longestStreak

  if (goal.lastStudyDate) {
    const lastDate = new Date(goal.lastStudyDate)
    lastDate.setHours(0, 0, 0, 0)

    const diffDays = Math.round(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 1) {
      currentStreak += 1
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak
      }
    } else if (diffDays > 1) {
      currentStreak = 1
    }
  } else {
    currentStreak = 1
    longestStreak = Math.max(longestStreak, 1)
  }

  await prisma.userGoal.update({
    where: { userId },
    data: {
      currentStreak,
      longestStreak,
      lastStudyDate: new Date(),
    },
  })
}

/**
 * Cập nhật thống kê ngày DailyStats
 */
export async function updateDailyStats(
  userId: string,
  isCorrect: boolean,
  timeTakenSeconds: number,
  isNewCard: boolean
) {
  const dateStr = getTodayDateString()

  await prisma.dailyStats.upsert({
    where: {
      userId_date: {
        userId,
        date: dateStr,
      },
    },
    create: {
      userId,
      date: dateStr,
      cardsStudied: 1,
      cardsCorrect: isCorrect ? 1 : 0,
      cardsIncorrect: isCorrect ? 0 : 1,
      timeSpent: timeTakenSeconds,
      newCardsSeen: isNewCard ? 1 : 0,
      reviewCards: isNewCard ? 0 : 1,
    },
    update: {
      cardsStudied: { increment: 1 },
      cardsCorrect: { increment: isCorrect ? 1 : 0 },
      cardsIncorrect: { increment: isCorrect ? 0 : 1 },
      timeSpent: { increment: timeTakenSeconds },
      newCardsSeen: isNewCard ? { increment: 1 } : undefined,
      reviewCards: !isNewCard ? { increment: 1 } : undefined,
    },
  })
}

/**
 * Xử lý đánh giá SRS cho một thẻ
 */
export async function processSRSReview({
  userId,
  cardId,
  isCorrect,
  rating,
  timeTaken = 0,
}: {
  userId: string
  cardId: string
  isCorrect?: boolean
  rating?: "again" | "hard" | "good" | "easy" | number
  timeTaken?: number
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { settings: true },
  })

  let srsMode = "auto"
  if (user?.settings && typeof user.settings === "object") {
    srsMode =
      ((user.settings as Record<string, unknown>).srsMode as string) || "auto"
  }

  const existingSRS = await prisma.sRSData.findUnique({
    where: {
      cardId_userId: {
        cardId,
        userId,
      },
    },
  })

  const currentState: CurrentSRSState = {
    status: existingSRS?.status || "New",
    easeFactor: existingSRS?.easeFactor || 2.5,
    interval: existingSRS?.interval || 0,
    repetitions: existingSRS?.repetitions || 0,
    correctCount: existingSRS?.correctCount || 0,
    incorrectCount: existingSRS?.incorrectCount || 0,
  }

  const isNewCard = !existingSRS || existingSRS.status === "New"
  let result: SRSCalculationResult

  if (typeof rating === "number") {
    result = calculateSM2(currentState, rating)
  } else if (
    rating === "again" ||
    rating === "hard" ||
    rating === "good" ||
    rating === "easy"
  ) {
    result = calculateSimpleSRS(currentState, rating)
  } else {
    const correct = isCorrect ?? true
    if (srsMode === "sm2") {
      const q = correct ? (timeTaken < 5 ? 5 : timeTaken < 15 ? 4 : 3) : 1
      result = calculateSM2(currentState, q)
    } else {
      result = calculateAutoSRS(currentState, correct, timeTaken)
    }
  }

  const updatedSRS = await prisma.sRSData.upsert({
    where: {
      cardId_userId: {
        cardId,
        userId,
      },
    },
    create: {
      userId,
      cardId,
      status: result.status,
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReviewDate: result.nextReviewDate,
      lastReviewDate: new Date(),
      correctCount: result.correctCount,
      incorrectCount: result.incorrectCount,
    },
    update: {
      status: result.status,
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReviewDate: result.nextReviewDate,
      lastReviewDate: new Date(),
      correctCount: result.correctCount,
      incorrectCount: result.incorrectCount,
    },
  })

  const effectiveIsCorrect =
    isCorrect !== undefined
      ? isCorrect
      : typeof rating === "number"
        ? rating >= 3
        : rating !== "again"

  await Promise.all([
    updateDailyStats(userId, effectiveIsCorrect, timeTaken, isNewCard),
    updateUserGoalAndStreak(userId),
  ])

  return updatedSRS
}
