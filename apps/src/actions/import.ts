"use server"

import path from "path"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { previewCSV, parseCSVContent } from "@/lib/parsers/csv"
import { previewText, parseTextContent } from "@/lib/parsers/text"
import { previewAnkiPackage, parseFullAnkiPackage } from "@/lib/parsers/anki"
import { createImportedStudySet } from "@/lib/import-utils"
import {
  ImportCSVSchema,
  ImportTextSchema,
  ImportJSONSchema,
  type BackupData,
  type AnkiFieldMapping,
} from "@/schemas/import-export"
import type {
  JLPTLevel,
  WordType,
  CardStatus,
  StudyMode,
} from "@/generated/prisma/client"

export type ImportActionResult<T = unknown> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

/**
 * 1. Xem trước file hoặc văn bản CSV/TSV
 */
export async function previewCSVAction(
  formDataOrInput:
    | FormData
    | {
        content: string
        delimiter?: string
      }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    let content = ""
    let delimiter: string | undefined

    if (formDataOrInput instanceof FormData) {
      const file = formDataOrInput.get("file") as File | null
      delimiter = (formDataOrInput.get("delimiter") as string) || undefined

      if (!file) {
        return {
          success: false,
          error: "Vui lòng chọn file CSV/TSV để xem trước.",
        }
      }
      content = await file.text()
    } else {
      content = formDataOrInput.content || ""
      delimiter = formDataOrInput.delimiter || undefined
    }

    if (!content.trim()) {
      return { success: false, error: "Nội dung CSV không được để trống." }
    }

    const preview = previewCSV(content, delimiter)
    return { success: true, data: preview }
  } catch (error) {
    console.error("❌ Lỗi previewCSVAction:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Lỗi khi phân tích file CSV.",
    }
  }
}

/**
 * 2. Import bộ thẻ từ file hoặc chuỗi CSV/TSV
 */
export async function importCSVAction(
  formDataOrPayload:
    | FormData
    | {
        setName: string
        description?: string
        folderId?: string
        content: string
        delimiter?: string
        hasHeader?: boolean
        columnMapping?: { termIndex: number; definitionIndex: number }
        tags?: string[]
      }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    let payload: unknown

    if (formDataOrPayload instanceof FormData) {
      const file = formDataOrPayload.get("file") as File | null
      const setName =
        (formDataOrPayload.get("setName") as string) ||
        file?.name?.replace(/\.[^/.]+$/, "") ||
        "CSV Import"
      const description = formDataOrPayload.get("description") as string | null
      const folderId = formDataOrPayload.get("folderId") as string | null
      const delimiter = (formDataOrPayload.get("delimiter") as string) || ","
      const hasHeader = formDataOrPayload.get("hasHeader") === "true"
      const columnMappingRaw = formDataOrPayload.get("columnMapping") as
        string | null
      const tagsRaw = formDataOrPayload.get("tags") as string | null

      let columnMapping = { termIndex: 0, definitionIndex: 1 }
      if (columnMappingRaw) {
        try {
          columnMapping = JSON.parse(columnMappingRaw)
        } catch (e) {
          console.warn("Không thể parse columnMapping JSON:", e)
        }
      }

      let tags: string[] = []
      if (tagsRaw) {
        try {
          tags = JSON.parse(tagsRaw)
        } catch {
          tags = tagsRaw
            .split(/[,;\s]+/)
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        }
      }

      const content = file ? await file.text() : ""

      payload = {
        setName,
        description,
        folderId,
        content,
        delimiter,
        hasHeader,
        columnMapping,
        tags,
      }
    } else {
      payload = formDataOrPayload
    }

    const validation = ImportCSVSchema.safeParse(payload)
    if (!validation.success) {
      return {
        success: false,
        error: "Dữ liệu cấu hình import CSV không hợp lệ.",
      }
    }

    const {
      setName,
      description,
      folderId,
      content,
      delimiter,
      hasHeader,
      columnMapping,
      tags,
    } = validation.data

    const cards = parseCSVContent(content, {
      delimiter,
      hasHeader,
      columnMapping,
    })

    if (cards.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy thẻ hợp lệ nào trong file CSV.",
      }
    }

    const result = await createImportedStudySet({
      userId: user.id,
      setName,
      description,
      folderId,
      globalTags: tags,
      cards,
    })

    revalidatePath("/library")
    return {
      success: true,
      data: {
        setId: result.setId,
        setName: result.setName,
        cardCount: result.cardCount,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi importCSVAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi import CSV.",
    }
  }
}

/**
 * 3. Xem trước văn bản phân cách
 */
export async function previewTextAction(params: {
  content: string
  termSeparator?: string
  cardSeparator?: string
}) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const { content, termSeparator, cardSeparator } = params
    if (!content || !content.trim()) {
      return { success: false, error: "Nội dung văn bản không được để trống." }
    }

    const preview = previewText(content, { termSeparator, cardSeparator })
    return { success: true, data: preview }
  } catch (error) {
    console.error("❌ Lỗi previewTextAction:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Lỗi khi phân tích văn bản xem trước.",
    }
  }
}

/**
 * 4. Import bộ thẻ từ văn bản
 */
export async function importTextAction(payload: unknown) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const validation = ImportTextSchema.safeParse(payload)
    if (!validation.success) {
      return {
        success: false,
        error: "Dữ liệu văn bản không hợp lệ.",
      }
    }

    const {
      setName,
      description,
      folderId,
      content,
      termDefSeparator,
      cardSeparator,
      tags,
    } = validation.data

    const cards = parseTextContent(content, {
      termSeparator: termDefSeparator,
      cardSeparator,
    })

    if (cards.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy thẻ hợp lệ nào trong văn bản nhập vào.",
      }
    }

    const result = await createImportedStudySet({
      userId: user.id,
      setName,
      description: description || null,
      folderId: folderId || null,
      globalTags: tags,
      cards,
    })

    revalidatePath("/library")
    return {
      success: true,
      data: {
        setId: result.setId,
        setName: result.setName,
        cardCount: result.cardCount,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi importTextAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi import văn bản.",
    }
  }
}

/**
 * 5. Xem trước gói Anki (.apkg)
 */
export async function previewAnkiAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const file = formData.get("file") as File | null
    if (!file) {
      return {
        success: false,
        error: "Vui lòng đính kèm file Anki (.apkg).",
      }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const previews = await previewAnkiPackage(buffer)

    return {
      success: true,
      data: {
        filename: file.name,
        decks: previews,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi previewAnkiAction:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Lỗi khi đọc file Anki .apkg.",
    }
  }
}

/**
 * 6. Import bộ thẻ từ gói Anki (.apkg)
 */
export async function importAnkiAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const file = formData.get("file") as File | null
    if (!file) {
      return {
        success: false,
        error: "Vui lòng đính kèm file Anki (.apkg).",
      }
    }

    const setNameInput = formData.get("setName") as string | null
    const description = formData.get("description") as string | null
    const folderId = formData.get("folderId") as string | null
    const deckId = formData.get("deckId") as string | null
    const tagsRaw = formData.get("tags") as string | null
    const fieldMappingRaw = formData.get("fieldMapping") as string | null

    let tags: string[] = []
    if (tagsRaw) {
      try {
        tags = JSON.parse(tagsRaw)
      } catch {
        tags = tagsRaw
          .split(/[,;\s]+/)
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      }
    }

    let fieldMapping: AnkiFieldMapping | undefined
    if (fieldMappingRaw) {
      try {
        fieldMapping = JSON.parse(fieldMappingRaw)
      } catch (e) {
        console.warn("Không thể parse fieldMapping JSON:", e)
      }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mediaTargetDir = path.join(process.cwd(), "public", "uploads", "anki")

    const parsed = await parseFullAnkiPackage(buffer, {
      deckId: deckId || undefined,
      fieldMapping,
      mediaTargetDir,
    })

    if (parsed.cards.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy thẻ hợp lệ nào trong bộ thẻ Anki đã chọn.",
      }
    }

    const finalSetName =
      setNameInput?.trim() || parsed.deckName || "Anki Import"

    const result = await createImportedStudySet({
      userId: user.id,
      setName: finalSetName,
      description: description || null,
      folderId: folderId || null,
      globalTags: tags,
      cards: parsed.cards,
    })

    revalidatePath("/library")
    return {
      success: true,
      data: {
        setId: result.setId,
        setName: result.setName,
        cardCount: result.cardCount,
        extractedMediaCount: parsed.extractedMediaCount,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi importAnkiAction:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Lỗi máy chủ khi import file Anki.",
    }
  }
}

/**
 * 7. Import bộ thẻ từ cấu trúc JSON
 */
export async function importJSONAction(rawInput: unknown) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để tiếp tục." }
    }

    const rawSets = Array.isArray(rawInput)
      ? rawInput
      : typeof rawInput === "object" &&
          rawInput !== null &&
          "studySets" in rawInput &&
          Array.isArray((rawInput as { studySets: unknown[] }).studySets)
        ? (rawInput as { studySets: unknown[] }).studySets
        : typeof rawInput === "object" &&
            rawInput !== null &&
            "sets" in rawInput &&
            Array.isArray((rawInput as { sets: unknown[] }).sets)
          ? (rawInput as { sets: unknown[] }).sets
          : [rawInput]

    const importedSets: Array<{
      setId: string
      setName: string
      cardCount: number
    }> = []

    for (const item of rawSets) {
      const validation = ImportJSONSchema.safeParse(item)
      if (!validation.success) {
        return {
          success: false,
          error: "Dữ liệu JSON không hợp lệ.",
        }
      }

      const {
        setName,
        description,
        sourceLanguage,
        targetLanguage,
        folderId,
        tags,
        cards,
      } = validation.data

      const res = await createImportedStudySet({
        userId: user.id,
        setName,
        description: description || null,
        sourceLanguage,
        targetLanguage,
        folderId: folderId || null,
        globalTags: tags,
        cards,
      })

      importedSets.push(res)
    }

    revalidatePath("/library")
    return {
      success: true,
      data: {
        importedCount: importedSets.length,
        sets: importedSets,
        setId: importedSets[0]?.setId,
        setName: importedSets[0]?.setName,
        cardCount: importedSets[0]?.cardCount,
      },
    }
  } catch (error) {
    console.error("❌ Lỗi importJSONAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi import JSON.",
    }
  }
}

/**
 * 8. Phục hồi toàn bộ dữ liệu từ bản sao lưu JSON (Restore Backup)
 */
export async function restoreBackupAction(formDataOrData: FormData | unknown) {
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
