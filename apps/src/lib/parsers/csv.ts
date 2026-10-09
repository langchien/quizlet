import type { JLPTLevel, WordType } from "@/generated/prisma/client"
import type { ColumnMapping } from "@/schemas/import-export"

export interface CSVPreviewResult {
  detectedDelimiter: string
  hasHeader: boolean
  headers: string[]
  totalRows: number
  sampleRows: string[][]
  suggestedMapping: ColumnMapping
}

export interface CSVParsedCard {
  term: string
  reading: string
  definition: string
  example?: string | null
  exampleTranslation?: string | null
  note?: string | null
  jlptLevel?: JLPTLevel | null
  wordType?: WordType | null
  tags: string[]
}

/**
 * Tự động nhận diện dấu phân cách phổ biến (, \t ; |)
 */
export function detectDelimiter(content: string): string {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 10)

  if (lines.length === 0) return ","

  const delimiters = [",", "\t", ";", "|"]
  const scores: Record<string, number> = { ",": 0, "\t": 0, ";": 0, "|": 0 }

  for (const del of delimiters) {
    const counts = lines.map((line) => line.split(del).length)
    const firstCount = counts[0]
    // Nếu các dòng có số lượng cột đồng đều > 1 thì có điểm cao
    if (firstCount > 1) {
      const isConsistent = counts.every((c) => c === firstCount)
      scores[del] = (isConsistent ? 100 : 10) * firstCount
    }
  }

  let bestDelimiter = ","
  let maxScore = -1
  for (const [del, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      bestDelimiter = del
    }
  }

  return bestDelimiter
}

/**
 * Parse một chuỗi CSV/TSV chuẩn hỗ trợ quote kép và dòng xuống hàng
 */
export function parseCSVRows(content: string, delimiter = ","): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ""
  let insideQuotes = false
  let i = 0

  const len = content.length

  while (i < len) {
    const char = content[i]
    const nextChar = content[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"'
        i += 2
        continue
      } else {
        insideQuotes = !insideQuotes
        i++
        continue
      }
    }

    if (!insideQuotes && char === delimiter) {
      currentRow.push(currentCell.trim())
      currentCell = ""
      i++
      continue
    }

    if (!insideQuotes && (char === "\r" || char === "\n")) {
      if (char === "\r" && nextChar === "\n") {
        i++
      }
      currentRow.push(currentCell.trim())
      currentCell = ""
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow)
      }
      currentRow = []
      i++
      continue
    }

    currentCell += char
    i++
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow)
    }
  }

  return rows
}

/**
 * Gợi ý ánh xạ cột dựa vào tiêu đề hoặc dữ liệu mẫu
 */
export function guessColumnMapping(headers: string[]): ColumnMapping {
  const lower = headers.map((h, i) => ({
    name: h.toLowerCase().trim(),
    index: i,
  }))

  const findIdx = (keywords: string[]) => {
    const found = lower.find((item) =>
      keywords.some((k) => item.name === k || item.name.includes(k))
    )
    return found ? found.index : undefined
  }

  const termIndex =
    findIdx([
      "term",
      "từ vựng",
      "từ",
      "kanji",
      "front",
      "expression",
      "tiếng nhật",
      "japanese",
    ]) ?? 0

  const readingIndex = findIdx([
    "reading",
    "cách đọc",
    "kana",
    "furigana",
    "hiragana",
    "âm đọc",
  ])

  const definitionIndex =
    findIdx([
      "definition",
      "nghĩa",
      "ý nghĩa",
      "tiếng việt",
      "meaning",
      "back",
      "dịch",
      "translation",
      "vietnamese",
    ]) ?? (headers.length > 1 ? 1 : 0)

  const exampleIndex = findIdx(["example", "ví dụ", "câu ví dụ", "sample"])
  const exampleTranslationIndex = findIdx([
    "example translation",
    "dịch ví dụ",
    "dịch câu",
    "câu dịch",
  ])
  const noteIndex = findIdx(["note", "ghi chú", "chú thích", "hint"])
  const jlptLevelIndex = findIdx(["jlpt", "level", "cấp độ"])
  const wordTypeIndex = findIdx(["word type", "type", "từ loại", "loại từ"])
  const tagsIndex = findIdx(["tags", "tag", "nhãn"])

  return {
    termIndex,
    readingIndex,
    definitionIndex,
    exampleIndex,
    exampleTranslationIndex,
    noteIndex,
    jlptLevelIndex,
    wordTypeIndex,
    tagsIndex,
  }
}

/**
 * Tạo dữ liệu xem trước CSV / TSV
 */
export function previewCSV(
  content: string,
  customDelimiter?: string
): CSVPreviewResult {
  const detectedDelimiter = customDelimiter || detectDelimiter(content)
  const rows = parseCSVRows(content, detectedDelimiter)

  if (rows.length === 0) {
    return {
      detectedDelimiter,
      hasHeader: false,
      headers: [],
      totalRows: 0,
      sampleRows: [],
      suggestedMapping: {
        termIndex: 0,
        definitionIndex: 1,
      },
    }
  }

  // Đoán xem dòng đầu có phải header không
  const firstRow = rows[0]
  const looksLikeHeader = firstRow.some((col) => {
    const low = col.toLowerCase()
    return (
      low.includes("term") ||
      low.includes("từ") ||
      low.includes("kanji") ||
      low.includes("reading") ||
      low.includes("cách đọc") ||
      low.includes("nghĩa") ||
      low.includes("definition") ||
      low.includes("meaning")
    )
  })

  const headers = looksLikeHeader
    ? firstRow
    : firstRow.map((_, i) => `Cột ${i + 1}`)

  const dataRows = looksLikeHeader ? rows.slice(1) : rows
  const suggestedMapping = guessColumnMapping(headers)

  return {
    detectedDelimiter,
    hasHeader: looksLikeHeader,
    headers,
    totalRows: dataRows.length,
    sampleRows: dataRows.slice(0, 10),
    suggestedMapping,
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
 * Parse toàn bộ CSV theo Column Mapping
 */
export function parseCSVContent(
  content: string,
  options: {
    delimiter?: string
    hasHeader?: boolean
    columnMapping: ColumnMapping
  }
): CSVParsedCard[] {
  const delimiter = options.delimiter || detectDelimiter(content)
  const rows = parseCSVRows(content, delimiter)
  const dataRows = options.hasHeader ? rows.slice(1) : rows
  const mapping = options.columnMapping

  const cards: CSVParsedCard[] = []

  for (const row of dataRows) {
    const getCol = (idx?: number | null) =>
      idx !== undefined && idx !== null && idx >= 0 && idx < row.length
        ? row[idx]?.trim()
        : null

    const term = getCol(mapping.termIndex) || ""
    let reading = getCol(mapping.readingIndex) || ""
    const definition = getCol(mapping.definitionIndex) || ""

    if (!term && !definition) continue

    // Tự động phân tách reading nếu trong term có ngoặc ví dụ: 食べる（たべる）
    if (!reading && term) {
      const match = term.match(/^(.*?)[(（]([^(（)）]+)[)）]$/)
      if (match) {
        reading = match[2].trim()
      }
    }

    const tags: string[] = []
    const tagsCol = getCol(mapping.tagsIndex)
    if (tagsCol) {
      tagsCol
        .split(/[,;\s]+/)
        .map((t) => t.trim().replace(/^#/, ""))
        .filter((t) => t.length > 0)
        .forEach((t) => tags.push(t))
    }

    cards.push({
      term: term || reading || "Không có tiêu đề",
      reading: reading || term,
      definition: definition || term,
      example: getCol(mapping.exampleIndex),
      exampleTranslation: getCol(mapping.exampleTranslationIndex),
      note: getCol(mapping.noteIndex),
      jlptLevel: parseJlpt(getCol(mapping.jlptLevelIndex)),
      wordType: parseWordType(getCol(mapping.wordTypeIndex)),
      tags,
    })
  }

  return cards
}
