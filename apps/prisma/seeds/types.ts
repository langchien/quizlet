import fs from "fs"
import path from "path"

export interface RawCardItem {
  term: string
  reading: string
  definition: string
  example?: string | null
  exampleTranslation?: string | null
  imageUrl?: string | null
  audioUrl?: string | null
  note?: string | null
  jlptLevel?: string | null
  wordType?: string | null
  radicals?: string | null
  strokeCount?: number | null
  onReading?: string | null
  kunReading?: string | null
  compounds?: string | null
  order?: number
  tags?: string[]
  srsStatus?: string
}

export interface RawStudySetData {
  app?: string
  version?: string
  exportedAt?: string
  studySet: {
    id?: string
    name: string
    description?: string | null
    sourceLanguage?: string
    targetLanguage?: string
    folderName?: string | null
    cardCount?: number
    cards: RawCardItem[]
  }
}

// Bảng màu phân loại nhãn (Tags)
export const TAG_COLOR_MAP: Record<string, string> = {
  N5: "#3B82F6", // Blue
  N4: "#10B981", // Green
  "Từ vựng": "#8B5CF6", // Purple
  Kanji: "#EC4899", // Pink
  "Ngữ pháp": "#F59E0B", // Amber
  "Động từ": "#EF4444", // Red
  "Danh từ": "#06B6D4", // Cyan
  "Tính từ": "#14B8A6", // Teal
  "Bài 1": "#6366F1", // Indigo
  "Bài 2": "#84CC16", // Lime
  "Bài 3": "#0EA5E9", // Sky
  "Bài 4": "#F97316", // Orange
  "Bài 5": "#A855F7", // Violet
  "Bài 6": "#EC4899", // Pink
  "Bài 7": "#10B981", // Emerald
  "Bài 8": "#F59E0B", // Amber
  "Bài 9": "#64748B", // Slate
  "Bài 10": "#3B82F6", // Blue
  Quizlet: "#2563EB", // Royal Blue
}

export const FALLBACK_TAG_PALETTE = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#14B8A6",
  "#6366F1",
  "#84CC16",
  "#F97316",
  "#A855F7",
]

export function getTagColor(tagName: string, index: number): string {
  if (TAG_COLOR_MAP[tagName]) {
    return TAG_COLOR_MAP[tagName]
  }
  return FALLBACK_TAG_PALETTE[index % FALLBACK_TAG_PALETTE.length]
}

// Hàm trích xuất số thứ tự bài học từ tên file hoặc tên bộ thẻ để sắp xếp đúng thứ tự (Bài 1 -> Bài 10)
export function extractLessonNumber(str: string): number {
  const match = str.match(/bài\s*(\d+)/i)
  return match ? parseInt(match[1], 10) : 999
}

// Tìm thư mục chứa dữ liệu thẻ (hỗ trợ cả data/cards và data/card)
export function resolveCardsDirectory(): string {
  const candidateDirs = [
    path.resolve(process.cwd(), "../data/cards"),
    path.resolve(process.cwd(), "../data/card"),
    path.resolve(process.cwd(), "data/cards"),
    path.resolve(process.cwd(), "data/card"),
    path.resolve(__dirname, "../../../data/cards"),
    path.resolve(__dirname, "../../../data/card"),
  ]

  for (const dir of candidateDirs) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      return dir
    }
  }

  throw new Error(
    `Không tìm thấy thư mục chứa thẻ card ở các đường dẫn dự kiến: ${candidateDirs.join(", ")}`
  )
}
