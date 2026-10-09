/**
 * Các hằng số và kiểu dữ liệu cốt lõi cho NihoMemo
 */

export const APP_NAME = "NihoMemo" as const
export const APP_TITLE = "NihoMemo (日本メモ)" as const

/**
 * Cấp độ năng lực Nhật ngữ JLPT
 */
export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const
export type JLPTLevel = (typeof JLPT_LEVELS)[number]

/**
 * Phân loại từ vựng và ngữ pháp tiếng Nhật
 */
export const WORD_TYPES = [
  "Noun",
  "Verb",
  "IAdjective",
  "NaAdjective",
  "Adverb",
  "Kanji",
  "Grammar",
  "Other",
] as const
export type WordType = (typeof WORD_TYPES)[number]

/**
 * Trạng thái thẻ trong thuật toán Spaced Repetition (SRS)
 */
export const CARD_STATUSES = ["New", "Learning", "Review", "Mastered"] as const
export type CardStatus = (typeof CARD_STATUSES)[number]

/**
 * 6 chế độ học tập chính của ứng dụng
 */
export const STUDY_MODES = [
  "Flashcard",
  "Learn",
  "Test",
  "Match",
  "Write",
  "Listen",
] as const
export type StudyMode = (typeof STUDY_MODES)[number]

/**
 * Thông tin người dùng cơ bản
 */
export interface UserBase {
  id: string
  email: string
  name: string
  avatar?: string | null
  settings?: {
    theme?: "light" | "dark" | "system"
    srsMode?: "auto" | "simple" | "advanced"
    dailyGoal?: number
    keyboardShortcuts?: boolean
  }
  createdAt: Date | string
  updatedAt: Date | string
}

/**
 * Phản hồi trạng thái máy chủ
 */
export interface HealthCheckResponse {
  status: "ok" | "error"
  timestamp: string
  uptime: number
  database: "connected" | "disconnected"
  environment: string
}
