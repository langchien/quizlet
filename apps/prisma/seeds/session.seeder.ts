import type {
  PrismaClient,
  StudySet,
  StudyMode,
} from "../../src/generated/prisma/client"

export async function seedStudySessions(
  prisma: PrismaClient,
  userId: string,
  targetSets: StudySet[]
): Promise<void> {
  if (targetSets.length === 0) return

  // Xóa các session cũ để làm mới
  await prisma.studySession.deleteMany({ where: { userId } })

  const modes: StudyMode[] = [
    "Flashcard",
    "Learn",
    "Test",
    "Match",
    "Write",
    "Listen",
  ]
  const now = new Date()

  for (let s = 1; s <= 25; s++) {
    const mode = modes[s % modes.length]
    const targetSet = targetSets[s % targetSets.length]
    const daysAgo = Math.floor(s * 1.2)
    const sessionDate = new Date(
      now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 3600000
    )
    const duration = 180 + Math.floor(Math.random() * 600) // 3 - 13 phút
    const total = 10 + Math.floor(Math.random() * 15)
    const correct = Math.floor(total * (0.75 + Math.random() * 0.23))
    const incorrect = total - correct
    const score = Number(((correct / total) * 100).toFixed(1))

    await prisma.studySession.create({
      data: {
        userId,
        studySetId: targetSet.id,
        mode,
        startedAt: sessionDate,
        endedAt: new Date(sessionDate.getTime() + duration * 1000),
        duration,
        totalCards: total,
        correctCards: correct,
        incorrectCards: incorrect,
        score,
      },
    })
  }

  console.log(
    "✅ [StudySessions] Đã nạp 25 phiên học tập mẫu trải dài các chế độ học."
  )
}
