import type { PrismaClient } from "../../src/generated/prisma/client"

export async function seedDailyStats(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  // Xóa thống kê cũ
  await prisma.dailyStats.deleteMany({ where: { userId } })

  const now = new Date()

  for (let d = 29; d >= 0; d--) {
    const dayDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000)
    const yyyy = dayDate.getFullYear()
    const mm = String(dayDate.getMonth() + 1).padStart(2, "0")
    const dd = String(dayDate.getDate()).padStart(2, "0")
    const dateStr = `${yyyy}-${mm}-${dd}`

    const studied = 15 + Math.floor(Math.random() * 25) // 15 - 40 thẻ
    const correct = Math.floor(studied * (0.8 + Math.random() * 0.18))
    const incorrect = studied - correct
    const timeSpent = studied * (18 + Math.floor(Math.random() * 15)) // 5 - 20 phút
    const newCards = Math.floor(Math.random() * 8) + 2
    const reviewCards = studied - newCards
    const streakVal = 30 - d // Chuỗi tăng dần từ 1 đến 30 ngày liên tiếp

    await prisma.dailyStats.create({
      data: {
        userId,
        date: dateStr,
        cardsStudied: studied,
        cardsCorrect: correct,
        cardsIncorrect: incorrect,
        timeSpent,
        newCardsSeen: newCards,
        reviewCards,
        streak: streakVal,
      },
    })
  }

  console.log(
    "✅ [DailyStats] Đã nạp 30 ngày thống kê liên tục với chuỗi Streak 30 ngày."
  )
}
