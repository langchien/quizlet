"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import type { BackupData } from "@/schemas/import-export"
import type {
  JLPTLevel,
  WordType,
  CardStatus,
  StudyMode,
} from "@/generated/prisma/client"
import type { ActionResponse } from "@/lib/action-client"

/**
 * 8. Phục hồi toàn bộ dữ liệu từ bản sao lưu JSON (Restore Backup)
 */
export async function restoreBackupAction(
  formDataOrData: FormData | unknown
): Promise<
  ActionResponse<{
    message: string
    summary: {
      restoredFoldersCount: number
      restoredSetsCount: number
      restoredCardsCount: number
      restoredTagsCount: number
      restoredSessionsCount: number
      restoredStatsCount: number
    }
  }>
> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    let backupData: Partial<BackupData> & Record<string, unknown>

    if (formDataOrData instanceof FormData) {
      const file = formDataOrData.get("file") as File | null
      if (!file) {
        return {
          success: false,
          error: "Vui lòng đính kèm file backup JSON.",
        }
      }
      const text = await file.text()
      backupData = JSON.parse(text)
    } else {
      backupData = formDataOrData as Partial<BackupData> &
        Record<string, unknown>
    }

    if (!backupData || backupData.app !== "NihoMemo") {
      return {
        success: false,
        error: "File sao lưu không đúng định dạng NihoMemo.",
      }
    }

    let restoredFoldersCount = 0
    let restoredSetsCount = 0
    let restoredCardsCount = 0
    let restoredTagsCount = 0
    let restoredSessionsCount = 0
    let restoredStatsCount = 0

    // 1. Phục hồi Cài đặt người dùng (User Settings)
    if (backupData.user?.settings) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          settings: backupData.user.settings,
        },
      })
    }

    // 2. Phục hồi Tags
    const tagMap = new Map<string, string>() // tagName -> tagId
    if (Array.isArray(backupData.tags)) {
      for (const t of backupData.tags) {
        if (!t.name) continue
        const tagRecord = await prisma.tag.upsert({
          where: {
            name_userId: {
              name: t.name,
              userId: user.id,
            },
          },
          update: {
            color: t.color || "#3B82F6",
          },
          create: {
            name: t.name,
            color: t.color || "#3B82F6",
            userId: user.id,
          },
        })
        tagMap.set(t.name, tagRecord.id)
        restoredTagsCount++
      }
    }

    // 3. Phục hồi Thư mục (Folders)
    const folderIdMap = new Map<string, string>() // oldFolderId -> newFolderId
    if (Array.isArray(backupData.folders)) {
      const pendingFolders = [...backupData.folders]
      let attempts = 0
      const maxAttempts = pendingFolders.length + 5

      while (pendingFolders.length > 0 && attempts < maxAttempts) {
        attempts++
        const folder = pendingFolders.shift()
        if (!folder) break

        const parentId = folder.parentId
          ? folderIdMap.get(folder.parentId)
          : null
        if (folder.parentId && !parentId) {
          pendingFolders.push(folder)
          continue
        }

        const createdFolder = await prisma.folder.create({
          data: {
            name: folder.name,
            description: folder.description || null,
            parentId: parentId || null,
            userId: user.id,
            order: folder.order || 0,
          },
        })
        folderIdMap.set(folder.id, createdFolder.id)
        restoredFoldersCount++
      }
    }

    // 4. Phục hồi StudySets và Cards
    const setIdMap = new Map<string, string>() // oldSetId -> newSetId
    if (Array.isArray(backupData.studySets)) {
      for (const setItem of backupData.studySets) {
        const newFolderId = setItem.folderId
          ? folderIdMap.get(setItem.folderId) || null
          : null

        const createdSet = await prisma.studySet.create({
          data: {
            name: setItem.name,
            description: setItem.description || null,
            sourceLanguage: setItem.sourceLanguage || "ja",
            targetLanguage: setItem.targetLanguage || "vi",
            folderId: newFolderId,
            userId: user.id,
            cardCount: Array.isArray(setItem.cards) ? setItem.cards.length : 0,
          },
        })
        setIdMap.set(setItem.id, createdSet.id)
        restoredSetsCount++

        if (Array.isArray(setItem.cards)) {
          for (let i = 0; i < setItem.cards.length; i++) {
            const c = setItem.cards[i]
            const createdCard = await prisma.card.create({
              data: {
                studySetId: createdSet.id,
                term: c.term || "Không có tiêu đề",
                reading: c.reading || c.term || "",
                definition: c.definition || c.term || "",
                example: c.example || null,
                exampleTranslation: c.exampleTranslation || null,
                imageUrl: c.imageUrl || null,
                audioUrl: c.audioUrl || null,
                note: c.note || null,
                jlptLevel: (c.jlptLevel as JLPTLevel) || null,
                wordType: (c.wordType as WordType) || null,
                radicals: c.radicals || null,
                strokeCount: c.strokeCount || null,
                onReading: c.onReading || null,
                kunReading: c.kunReading || null,
                compounds: c.compounds || null,
                order: typeof c.order === "number" ? c.order : i,
              },
            })
            restoredCardsCount++

            // Phục hồi SRS Data
            const srs = c.srsData
            await prisma.sRSData.create({
              data: {
                cardId: createdCard.id,
                userId: user.id,
                status: (srs?.status as CardStatus) || "New",
                easeFactor:
                  typeof srs?.easeFactor === "number" ? srs.easeFactor : 2.5,
                interval: typeof srs?.interval === "number" ? srs.interval : 0,
                repetitions:
                  typeof srs?.repetitions === "number" ? srs.repetitions : 0,
                nextReviewDate: srs?.nextReviewDate
                  ? new Date(srs.nextReviewDate)
                  : new Date(),
                lastReviewDate: srs?.lastReviewDate
                  ? new Date(srs.lastReviewDate)
                  : null,
                correctCount: srs?.correctCount || 0,
                incorrectCount: srs?.incorrectCount || 0,
              },
            })

            // Phục hồi Card Tags
            if (Array.isArray(c.tags)) {
              for (const tagName of c.tags) {
                const cleanedTag = tagName.trim().replace(/^#/, "")
                if (!cleanedTag) continue

                let tagId = tagMap.get(cleanedTag)
                if (!tagId) {
                  const newTag = await prisma.tag.upsert({
                    where: {
                      name_userId: { name: cleanedTag, userId: user.id },
                    },
                    update: {},
                    create: {
                      name: cleanedTag,
                      color: "#3B82F6",
                      userId: user.id,
                    },
                  })
                  tagId = newTag.id
                  tagMap.set(cleanedTag, tagId)
                }

                await prisma.cardTag.create({
                  data: {
                    cardId: createdCard.id,
                    tagId,
                  },
                })
              }
            }
          }
        }
      }
    }

    // 5. Phục hồi Nhật ký phiên học (Study Sessions)
    if (Array.isArray(backupData.studySessions)) {
      for (const ss of backupData.studySessions) {
        const newSetId = ss.studySetId
          ? setIdMap.get(ss.studySetId) || null
          : null
        await prisma.studySession.create({
          data: {
            userId: user.id,
            studySetId: newSetId,
            mode: (ss.mode as StudyMode) || "Flashcard",
            startedAt: new Date(ss.startedAt),
            endedAt: ss.endedAt ? new Date(ss.endedAt) : null,
            duration: ss.duration || 0,
            totalCards: ss.totalCards || 0,
            correctCards: ss.correctCards || 0,
            incorrectCards: ss.incorrectCards || 0,
            score: ss.score || 0,
          },
        })
        restoredSessionsCount++
      }
    }

    // 6. Phục hồi Thống kê ngày (Daily Stats)
    if (Array.isArray(backupData.dailyStats)) {
      for (const ds of backupData.dailyStats) {
        if (!ds.date) continue
        await prisma.dailyStats.upsert({
          where: {
            userId_date: {
              userId: user.id,
              date: ds.date,
            },
          },
          update: {
            cardsStudied: ds.cardsStudied || 0,
            cardsCorrect: ds.cardsCorrect || 0,
            cardsIncorrect: ds.cardsIncorrect || 0,
            timeSpent: ds.timeSpent || 0,
            newCardsSeen: ds.newCardsSeen || 0,
            reviewCards: ds.reviewCards || 0,
            streak: ds.streak || 0,
          },
          create: {
            userId: user.id,
            date: ds.date,
            cardsStudied: ds.cardsStudied || 0,
            cardsCorrect: ds.cardsCorrect || 0,
            cardsIncorrect: ds.cardsIncorrect || 0,
            timeSpent: ds.timeSpent || 0,
            newCardsSeen: ds.newCardsSeen || 0,
            reviewCards: ds.reviewCards || 0,
            streak: ds.streak || 0,
          },
        })
        restoredStatsCount++
      }
    }

    // 7. Phục hồi Mục tiêu (User Goal)
    if (backupData.userGoal) {
      await prisma.userGoal.upsert({
        where: { userId: user.id },
        update: {
          dailyCardTarget: backupData.userGoal.dailyCardTarget || 20,
          dailyTimeTarget: backupData.userGoal.dailyTimeTarget || 15,
          currentStreak: backupData.userGoal.currentStreak || 0,
          longestStreak: backupData.userGoal.longestStreak || 0,
          lastStudyDate: backupData.userGoal.lastStudyDate
            ? new Date(backupData.userGoal.lastStudyDate)
            : null,
        },
        create: {
          userId: user.id,
          dailyCardTarget: backupData.userGoal.dailyCardTarget || 20,
          dailyTimeTarget: backupData.userGoal.dailyTimeTarget || 15,
          currentStreak: backupData.userGoal.currentStreak || 0,
          longestStreak: backupData.userGoal.longestStreak || 0,
          lastStudyDate: backupData.userGoal.lastStudyDate
            ? new Date(backupData.userGoal.lastStudyDate)
            : null,
        },
      })
    }

    revalidatePath("/library")
    revalidatePath("/stats")
    revalidatePath("/settings")

    return {
      success: true,
      data: {
        message: "Khôi phục dữ liệu từ bản sao lưu thành công!",
        summary: {
          restoredFoldersCount,
          restoredSetsCount,
          restoredCardsCount,
          restoredTagsCount,
          restoredSessionsCount,
          restoredStatsCount,
        },
      },
    }
  } catch (error) {
    console.error("❌ Lỗi restoreBackupAction:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Lỗi khi phục hồi dữ liệu từ bản sao lưu.",
    }
  }
}
