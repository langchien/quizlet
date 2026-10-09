import JSZip from "jszip"
import initSqlJs, { Database, SqlJsStatic } from "sql.js"
import fs from "fs/promises"
import path from "path"
import type { JLPTLevel, WordType } from "@/generated/prisma/client"
import type { AnkiFieldMapping } from "@/schemas/import-export"

let sqlPromise: Promise<SqlJsStatic> | null = null

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs()
  }
  return sqlPromise
}

export interface AnkiDeckPreview {
  id: number | string
  name: string
  cardCount: number
  modelName: string
  fields: string[]
  suggestedMapping: AnkiFieldMapping
  sampleCards: Array<{
    term: string
    reading: string
    definition: string
    example?: string | null
    exampleTranslation?: string | null
    rawFields: Record<string, string>
  }>
}

export interface AnkiParsedCard {
  term: string
  reading: string
  definition: string
  example?: string | null
  exampleTranslation?: string | null
  imageUrl?: string | null
  audioUrl?: string | null
  note?: string | null
  jlptLevel?: JLPTLevel | null
  wordType?: WordType | null
  radicals?: string | null
  strokeCount?: number | null
  onReading?: string | null
  kunReading?: string | null
  compounds?: string | null
  tags: string[]
}

/**
 * Loại bỏ HTML tags và định dạng lại văn bản thuần túy hoặc furigana
 */
export function cleanHtmlText(html: string): string {
  if (!html) return ""
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<div>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p>/gi, "")
    .replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/gi, "$1($2)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

/**
 * Tách tham chiếu âm thanh và hình ảnh từ nội dung HTML của Anki
 */
export function extractMediaReferences(content: string): {
  cleanText: string
  audioFiles: string[]
  imageFiles: string[]
} {
  const audioFiles: string[] = []
  const imageFiles: string[] = []

  // Trích xuất [sound:filename.mp3]
  const soundRegex = /\[sound:([^\]]+)\]/gi
  let match: RegExpExecArray | null
  while ((match = soundRegex.exec(content)) !== null) {
    if (match[1]) audioFiles.push(match[1].trim())
  }

  // Trích xuất <img src="filename.png" />
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  while ((match = imgRegex.exec(content)) !== null) {
    if (match[1]) imageFiles.push(match[1].trim())
  }

  // Làm sạch chuỗi
  let cleanText = content.replace(soundRegex, "").replace(imgRegex, "")
  cleanText = cleanHtmlText(cleanText)

  return { cleanText, audioFiles, imageFiles }
}

/**
 * Gợi ý ánh xạ các trường từ tên trường trong Anki Model
 */
export function guessFieldMapping(fieldNames: string[]): AnkiFieldMapping {
  const lowerFields = fieldNames.map((f) => ({
    orig: f,
    low: f.toLowerCase().trim(),
  }))

  const findField = (keywords: string[]) => {
    const found = lowerFields.find((f) =>
      keywords.some((k) => f.low === k || f.low.includes(k))
    )
    return found ? found.orig : undefined
  }

  const term = findField([
    "expression",
    "term",
    "front",
    "kanji",
    "word",
    "vocab",
    "từ vựng",
    "từ",
    "hán tự",
    "japanese",
  ])

  const reading = findField([
    "reading",
    "kana",
    "furigana",
    "hiragana",
    "cách đọc",
    "âm đọc",
    "pronunciation",
    "phát âm",
  ])

  const definition = findField([
    "meaning",
    "definition",
    "back",
    "vietnamese",
    "tiếng việt",
    "dịch",
    "nghĩa",
    "ý nghĩa",
    "translation",
    "english",
  ])

  const example = findField([
    "example",
    "sentence",
    "ví dụ",
    "câu ví dụ",
    "sample",
  ])

  const exampleTranslation = findField([
    "example meaning",
    "example translation",
    "dịch ví dụ",
    "dịch câu",
    "câu dịch",
  ])

  const note = findField([
    "note",
    "ghi chú",
    "hint",
    "extra",
    "chú thích",
    "memo",
  ])

  const jlptLevel = findField(["jlpt", "level", "cấp độ"])
  const wordType = findField(["word type", "type", "pos", "từ loại"])

  return {
    term: term || (fieldNames.length > 0 ? fieldNames[0] : null),
    reading: reading || null,
    definition:
      definition ||
      (fieldNames.length > 1
        ? fieldNames[1]
        : fieldNames.length > 0
          ? fieldNames[0]
          : null),
    example: example || null,
    exampleTranslation: exampleTranslation || null,
    note: note || null,
    jlptLevel: jlptLevel || null,
    wordType: wordType || null,
  }
}

/**
 * Xử lý JLPT enum
 */
function parseJlpt(val?: string | null): JLPTLevel | null {
  if (!val) return null
  const cleaned = val.toUpperCase().trim()
  if (["N5", "N4", "N3", "N2", "N1"].includes(cleaned)) {
    return cleaned as JLPTLevel
  }
  const match = cleaned.match(/N[1-5]/)
  if (match) return match[0] as JLPTLevel
  return null
}

/**
 * Xử lý WordType enum
 */
function parseWordType(val?: string | null): WordType | null {
  if (!val) return null
  const low = val.toLowerCase().trim()
  if (low.includes("danh từ") || low.includes("noun")) return "Noun"
  if (low.includes("động từ") || low.includes("verb")) return "Verb"
  if (
    low.includes("tính từ i") ||
    low.includes("tính từ đuôi i") ||
    low.includes("i-adj")
  )
    return "IAdjective"
  if (
    low.includes("tính từ na") ||
    low.includes("tính từ đuôi na") ||
    low.includes("na-adj")
  )
    return "NaAdjective"
  if (
    low.includes("phó từ") ||
    low.includes("trạng từ") ||
    low.includes("adverb")
  )
    return "Adverb"
  if (low.includes("kanji") || low.includes("hán tự")) return "Kanji"
  if (low.includes("ngữ pháp") || low.includes("grammar")) return "Grammar"
  return "Other"
}

/**
 * Đọc file .apkg và trích xuất Decks, Models, Fields, Sample Cards để Preview
 */
export async function previewAnkiPackage(
  zipBuffer: Buffer
): Promise<AnkiDeckPreview[]> {
  const SQL = await getSqlJs()
  const zip = await JSZip.loadAsync(zipBuffer)

  // Tìm file SQLite database
  const dbFile =
    zip.file("collection.anki21b") ||
    zip.file("collection.anki21") ||
    zip.file("collection.anki2")

  if (!dbFile) {
    throw new Error(
      "Không tìm thấy cơ sở dữ liệu Anki (collection.anki2) trong file .apkg"
    )
  }

  const dbData = await dbFile.async("uint8array")
  const db: Database = new SQL.Database(dbData)

  try {
    // 1. Đọc models và decks từ bảng col
    const colResult = db.exec("SELECT models, decks FROM col LIMIT 1")
    if (!colResult.length || !colResult[0].values.length) {
      throw new Error("Không thể đọc thông tin cấu trúc bộ thẻ Anki.")
    }

    const [modelsJsonStr, decksJsonStr] = colResult[0].values[0] as [
      string,
      string,
    ]
    const models = JSON.parse(modelsJsonStr || "{}") as Record<
      string,
      {
        id: number | string
        name: string
        flds: Array<{ name: string; ord: number }>
      }
    >
    const decks = JSON.parse(decksJsonStr || "{}") as Record<
      string,
      { id: number | string; name: string }
    >

    // 2. Đọc notes và cards
    const cardsResult = db.exec(
      "SELECT c.did, n.mid, n.flds, n.tags FROM cards c JOIN notes n ON c.nid = n.id"
    )

    const deckCardsMap = new Map<
      string,
      Array<{ flds: string; tags: string; mid: string }>
    >()

    if (cardsResult.length > 0 && cardsResult[0].values) {
      for (const row of cardsResult[0].values) {
        const [did, mid, flds, tags] = row as [
          number | string,
          number | string,
          string,
          string,
        ]
        const deckKey = String(did)
        if (!deckCardsMap.has(deckKey)) {
          deckCardsMap.set(deckKey, [])
        }
        deckCardsMap.get(deckKey)!.push({
          flds: String(flds || ""),
          tags: String(tags || ""),
          mid: String(mid || ""),
        })
      }
    }

    const previewList: AnkiDeckPreview[] = []

    for (const [deckIdStr, deckObj] of Object.entries(decks)) {
      // Bỏ qua default deck rỗng
      const deckCards = deckCardsMap.get(deckIdStr) || []
      if (deckCards.length === 0 && deckObj.name === "Default") {
        continue
      }

      // Xác định model chính của deck
      const firstMid = deckCards[0]?.mid || Object.keys(models)[0]
      const model = models[firstMid]
      const fields = model?.flds
        ? [...model.flds]
            .sort((a, b) => (a.ord || 0) - (b.ord || 0))
            .map((f) => f.name)
        : []

      const suggestedMapping = guessFieldMapping(fields)

      // Tạo mẫu thẻ hiển thị preview (tối đa 5 thẻ mẫu)
      const sampleCards = deckCards.slice(0, 5).map((card) => {
        const fieldValues = card.flds.split("\x1f")
        const rawFields: Record<string, string> = {}
        fields.forEach((fName, idx) => {
          rawFields[fName] = cleanHtmlText(fieldValues[idx] || "")
        })

        const termField = suggestedMapping.term || fields[0] || ""
        const readingField = suggestedMapping.reading || ""
        const defField =
          suggestedMapping.definition || fields[1] || fields[0] || ""
        const exField = suggestedMapping.example || ""
        const exTrField = suggestedMapping.exampleTranslation || ""

        return {
          term: rawFields[termField] || "",
          reading: rawFields[readingField] || "",
          definition: rawFields[defField] || "",
          example: rawFields[exField] || null,
          exampleTranslation: rawFields[exTrField] || null,
          rawFields,
        }
      })

      previewList.push({
        id: deckObj.id,
        name: deckObj.name,
        cardCount: deckCards.length,
        modelName: model?.name || "Standard Model",
        fields,
        suggestedMapping,
        sampleCards,
      })
    }

    return previewList
  } finally {
    db.close()
  }
}

/**
 * Đọc toàn bộ nội dung file .apkg và trích xuất cards theo mapping và lưu media
 */
export async function parseFullAnkiPackage(
  zipBuffer: Buffer,
  options: {
    deckId?: number | string
    fieldMapping?: AnkiFieldMapping
    mediaTargetDir?: string
  }
): Promise<{
  deckName: string
  cards: AnkiParsedCard[]
  extractedMediaCount: number
}> {
  const SQL = await getSqlJs()
  const zip = await JSZip.loadAsync(zipBuffer)

  const dbFile =
    zip.file("collection.anki21b") ||
    zip.file("collection.anki21") ||
    zip.file("collection.anki2")

  if (!dbFile) {
    throw new Error("Không tìm thấy collection.anki2 trong file .apkg")
  }

  // 1. Trích xuất Media map nếu có
  const mediaMap: Record<string, string> = {}
  const mediaFile = zip.file("media")
  if (mediaFile) {
    try {
      const mediaJsonStr = await mediaFile.async("string")
      const parsed = JSON.parse(mediaJsonStr || "{}")
      Object.assign(mediaMap, parsed)
    } catch (e) {
      console.warn("Không thể parse file media anki:", e)
    }
  }

  // Lưu media files nếu có mediaTargetDir
  const mediaPathMap = new Map<string, string>()
  let extractedMediaCount = 0

  if (options.mediaTargetDir && Object.keys(mediaMap).length > 0) {
    await fs.mkdir(options.mediaTargetDir, { recursive: true })
    for (const [keyIndex, originalFilename] of Object.entries(mediaMap)) {
      const fileInZip = zip.file(keyIndex)
      if (fileInZip) {
        try {
          const fileData = await fileInZip.async("nodebuffer")
          const safeName = `${Date.now()}_${originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`
          const destPath = path.join(options.mediaTargetDir, safeName)
          await fs.writeFile(destPath, fileData)
          mediaPathMap.set(originalFilename, `/uploads/anki/${safeName}`)
          extractedMediaCount++
        } catch (e) {
          console.error(`Lỗi trích xuất media ${originalFilename}:`, e)
        }
      }
    }
  }

  // 2. Mở SQLite Database
  const dbData = await dbFile.async("uint8array")
  const db: Database = new SQL.Database(dbData)

  try {
    const colResult = db.exec("SELECT models, decks FROM col LIMIT 1")
    if (!colResult.length || !colResult[0].values.length) {
      throw new Error("Không thể đọc thông tin cấu trúc bộ thẻ Anki.")
    }

    const [modelsJsonStr, decksJsonStr] = colResult[0].values[0] as [
      string,
      string,
    ]
    const models = JSON.parse(modelsJsonStr || "{}") as Record<
      string,
      {
        id: number | string
        name: string
        flds: Array<{ name: string; ord: number }>
      }
    >
    const decks = JSON.parse(decksJsonStr || "{}") as Record<
      string,
      { id: number | string; name: string }
    >

    // Xác định deck mục tiêu
    let targetDeckId = options.deckId ? String(options.deckId) : undefined
    if (!targetDeckId) {
      const nonDefaultDeck = Object.keys(decks).find(
        (dId) => decks[dId].name !== "Default"
      )
      targetDeckId = nonDefaultDeck || Object.keys(decks)[0]
    }

    const targetDeckName = decks[targetDeckId]?.name || "Anki Import Set"

    // Query cards trong deck
    let query =
      "SELECT c.did, n.mid, n.flds, n.tags FROM cards c JOIN notes n ON c.nid = n.id"
    if (targetDeckId) {
      query += ` WHERE c.did = ${targetDeckId}`
    }

    const cardsResult = db.exec(query)
    const cards: AnkiParsedCard[] = []

    if (cardsResult.length > 0 && cardsResult[0].values) {
      for (const row of cardsResult[0].values) {
        const [, mid, flds, rawTags] = row as [
          number | string,
          number | string,
          string,
          string,
        ]
        const model = models[String(mid)]
        const fields = model?.flds
          ? [...model.flds]
              .sort((a, b) => (a.ord || 0) - (b.ord || 0))
              .map((f) => f.name)
          : []

        const fieldValues = String(flds || "").split("\x1f")
        const rawFields: Record<string, string> = {}
        const rawFieldsHtml: Record<string, string> = {}

        fields.forEach((fName, idx) => {
          const rawVal = fieldValues[idx] || ""
          rawFieldsHtml[fName] = rawVal
          rawFields[fName] = cleanHtmlText(rawVal)
        })

        const mapping = options.fieldMapping || guessFieldMapping(fields)

        const termField = mapping.term || fields[0] || ""
        const readingField = mapping.reading || ""
        const defField = mapping.definition || fields[1] || fields[0] || ""
        const exField = mapping.example || ""
        const exTrField = mapping.exampleTranslation || ""
        const noteField = mapping.note || ""
        const jlptField = mapping.jlptLevel || ""
        const wordTypeField = mapping.wordType || ""

        const termRawHtml = rawFieldsHtml[termField] || ""
        const termMedia = extractMediaReferences(termRawHtml)

        const defRawHtml = rawFieldsHtml[defField] || ""
        const defMedia = extractMediaReferences(defRawHtml)

        const term = termMedia.cleanText || rawFields[termField] || ""
        let reading = readingField ? rawFields[readingField] || "" : ""
        const definition = defMedia.cleanText || rawFields[defField] || ""

        // Nếu term rỗng và reading có thì lấy reading làm term
        if (!term && reading) {
          // swap
        }

        // Bỏ qua thẻ hoàn toàn rỗng
        if (!term && !definition) {
          continue
        }

        // Nếu reading rỗng nhưng term chứa furigana dạng 漢字[かんじ]
        if (!reading) {
          const bracketMatch = term.match(/\[(.*?)\]/)
          if (bracketMatch) {
            reading = bracketMatch[1]
          }
        }

        // Image / Audio mapping
        let imageUrl: string | null = null
        let audioUrl: string | null = null

        const allImages = [...termMedia.imageFiles, ...defMedia.imageFiles]
        const allAudios = [...termMedia.audioFiles, ...defMedia.audioFiles]

        if (allImages.length > 0 && mediaPathMap.has(allImages[0])) {
          imageUrl = mediaPathMap.get(allImages[0])!
        }
        if (allAudios.length > 0 && mediaPathMap.has(allAudios[0])) {
          audioUrl = mediaPathMap.get(allAudios[0])!
        }

        // Tags
        const tags = String(rawTags || "")
          .trim()
          .split(/\s+/)
          .filter((t) => t.length > 0)

        cards.push({
          term: term || reading || "Không có tiêu đề",
          reading: reading || term,
          definition: definition || term,
          example: exField ? rawFields[exField] || null : null,
          exampleTranslation: exTrField ? rawFields[exTrField] || null : null,
          imageUrl,
          audioUrl,
          note: noteField ? rawFields[noteField] || null : null,
          jlptLevel: parseJlpt(jlptField ? rawFields[jlptField] : null),
          wordType: parseWordType(
            wordTypeField ? rawFields[wordTypeField] : null
          ),
          tags,
        })
      }
    }

    return {
      deckName: targetDeckName,
      cards,
      extractedMediaCount,
    }
  } finally {
    db.close()
  }
}
