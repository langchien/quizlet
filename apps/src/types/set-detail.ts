import { LucideIcon } from "lucide-react"

export interface CardItem {
  id: string
  studySetId: string
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
  order: number
  tags: Array<{ id: string; name: string; color: string }>
  srsData?: {
    status: "New" | "Learning" | "Review" | "Mastered"
    interval: number
    repetitions: number
  } | null
}

export interface SetDetailData {
  id: string
  name: string
  description?: string | null
  sourceLanguage: string
  targetLanguage: string
  folderId?: string | null
  userId: string
  cardCount: number
  folder?: { id: string; name: string } | null
  cards: CardItem[]
  progress?: {
    mastered: number
    learning: number
    new: number
    percentage: number
  }
}

export interface TagItem {
  id: string
  name: string
  color: string
}

export interface StudyModeItem {
  title: string
  desc: string
  icon: LucideIcon
  href: string
  color: string
}
