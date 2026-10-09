import fs from "fs"
import path from "path"
import type {
  PrismaClient,
  StudySet,
  JLPTLevel,
  WordType,
  CardStatus,
} from "../../src/generated/prisma/client"
import {
  extractLessonNumber,
  resolveCardsDirectory,
  type RawStudySetData,
} from "./types"

// Đọc toàn bộ file JSON từ thư mục data/cards và sắp xếp theo thứ tự bài học
export function loadRawCardSets(): RawStudySetData[] {
  const cardsDir = resolveCardsDirectory()
  console.log(`📂 [Data] Tìm thấy thư mục dữ liệu thẻ: ${cardsDir}`)

  const jsonFiles = fs
    .readdirSync(cardsDir)
    .filter((file) => file.endsWith(".json"))

  if (jsonFiles.length === 0) {
    throw new Error(`Không tìm thấy bất kỳ tệp JSON nào trong ${cardsDir}`)
  }

  // Sắp xếp các tệp theo thứ tự bài học (Bài 1 -> Bài 10)
  jsonFiles.sort((a, b) => extractLessonNumber(a) - extractLessonNumber(b))

  console.log(
    `📑 [Data] Phát hiện ${jsonFiles.length} tệp dữ liệu bộ thẻ: \n${jsonFiles
      .map((f, i) => `   ${i + 1}. ${f}`)
      .join("\n")}`
  )

  const rawSetList: RawStudySetData[] = []
  for (const file of jsonFiles) {
    const filePath = path.join(cardsDir, file)
    const content = fs.readFileSync(filePath, "utf-8")
    const parsedData: RawStudySetData = JSON.parse(content)
    rawSetList.push(parsedData)
  }

  return rawSetList
}

export async function seedCardsAndSets(
  prisma: PrismaClient,
  userId: string,
  rawSetList: RawStudySetData[],
  defaultFolderId: string,
  folderMap: Map<string, string>,
  tagMap: Map<string, string>
): Promise<StudySet[]> {
  // 1. Dọn dẹp các bộ thẻ cũ của Admin để nạp mới hoàn toàn sạch sẽ
  await prisma.studySet.deleteMany({
    where: { userId },
  })
  console.log("🧹 [Clean] Đã dọn dẹp các bộ thẻ cũ trước khi nạp dữ liệu mới.")

  const createdSetsList: StudySet[] = []
  let totalCardsCount = 0

  const validWordTypes: WordType[] = [
    "Noun",
    "Verb",
    "IAdjective",
    "NaAdjective",
    "Adverb",
    "Kanji",
    "Grammar",
    "Other",
  ]
  const validJlptLevels: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"]

  for (const rawSet of rawSetList) {
    const setData = rawSet.studySet

    // Xác định thư mục cha phù hợp
    let folderId = defaultFolderId
    if (setData.folderName && folderMap.has(setData.folderName)) {
      folderId = folderMap.get(setData.folderName)!
    }

    // Tạo StudySet
    const createdSet = await prisma.studySet.create({
      data: {
        name: setData.name,
        description:
          setData.description ||
          "Bộ từ vựng tiếng Nhật chuẩn Minna no Nihongo sơ cấp",
        sourceLanguage: setData.sourceLanguage || "ja",
        targetLanguage: setData.targetLanguage || "vi",
        folderId,
        userId,
        cardCount: setData.cards.length,
      },
    })
    createdSetsList.push(createdSet)

    // Tạo từng Thẻ Card & SRS
    for (let i = 0; i < setData.cards.length; i++) {
      const c = setData.cards[i]

      // Chuẩn hóa Enum
      let jlptLevel: JLPTLevel | null = null
      if (c.jlptLevel && validJlptLevels.includes(c.jlptLevel as JLPTLevel)) {
        jlptLevel = c.jlptLevel as JLPTLevel
      } else {
        jlptLevel = "N5"
      }

      let wordType: WordType | null = "Other"
      if (c.wordType && validWordTypes.includes(c.wordType as WordType)) {
        wordType = c.wordType as WordType
      }

      const card = await prisma.card.create({
        data: {
          studySetId: createdSet.id,
          term: c.term,
          reading: c.reading || c.term,
          definition: c.definition,
          example: c.example?.trim() ? c.example.trim() : null,
          exampleTranslation: c.exampleTranslation?.trim()
            ? c.exampleTranslation.trim()
            : null,
          imageUrl: c.imageUrl || null,
          audioUrl: c.audioUrl || null,
          note: c.note || null,
          jlptLevel,
          wordType,
          radicals: c.radicals || null,
          strokeCount: typeof c.strokeCount === "number" ? c.strokeCount : null,
          onReading: c.onReading || null,
          kunReading: c.kunReading || null,
          compounds: c.compounds || null,
          order: typeof c.order === "number" ? c.order : i,
        },
      })
      totalCardsCount++

      // Gán Tags cho Card
      if (Array.isArray(c.tags)) {
        for (const tagName of c.tags) {
          const tagId = tagMap.get(tagName.trim())
          if (tagId) {
            await prisma.cardTag.create({
              data: {
                cardId: card.id,
                tagId,
              },
            })
          }
        }
      }

      // Xử lý dữ liệu SRS (Spaced Repetition System)
      let srsStatus: CardStatus = "New"
      if (
        c.srsStatus &&
        ["New", "Learning", "Review", "Mastered"].includes(c.srsStatus)
      ) {
        srsStatus = c.srsStatus as CardStatus
      }

      let repetitions = 0
      let interval = 0
      let easeFactor = 2.5
      let correctCount = 0
      let incorrectCount = 0
      let nextReviewDate = new Date()
      let lastReviewDate: Date | null = null

      if (srsStatus === "Mastered") {
        repetitions = 6
        interval = 28
        easeFactor = 2.7
        correctCount = 12
        incorrectCount = 1
        lastReviewDate = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        nextReviewDate = new Date(Date.now() + 24 * 24 * 60 * 60 * 1000)
      } else if (srsStatus === "Review") {
        repetitions = 3
        interval = 3
        easeFactor = 2.4
        correctCount = 5
        incorrectCount = 2
        lastReviewDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        nextReviewDate = new Date(Date.now() - 2 * 60 * 60 * 1000) // Đến hạn ôn hôm nay
      } else if (srsStatus === "Learning") {
        repetitions = 1
        interval = 1
        easeFactor = 2.3
        correctCount = 2
        incorrectCount = 2
        lastReviewDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        nextReviewDate = new Date(Date.now() + 6 * 60 * 60 * 1000)
      } else {
        srsStatus = "New"
        repetitions = 0
        interval = 0
        easeFactor = 2.5
        correctCount = 0
        incorrectCount = 0
        lastReviewDate = null
        nextReviewDate = new Date()
      }

      await prisma.sRSData.create({
        data: {
          cardId: card.id,
          userId,
          status: srsStatus,
          repetitions,
          interval,
          easeFactor,
          correctCount,
          incorrectCount,
          lastReviewDate,
          nextReviewDate,
        },
      })
    }

    console.log(
      `   ✓ Đã nạp "${setData.name}" (${setData.cards.length} thẻ ghi nhớ)`
    )
  }

  console.log(
    `✅ [Sets & Cards] Hoàn thành nạp ${createdSetsList.length} bộ thẻ với tổng cộng ${totalCardsCount} thẻ từ thư mục data/cards.`
  )

  return createdSetsList
}
