export interface FlashcardItem {
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
  tags?: Array<{ id: string; name: string; color: string }>
  srsData?: {
    status: string
    easeFactor: number
    interval: number
    repetitions: number
  }
}
