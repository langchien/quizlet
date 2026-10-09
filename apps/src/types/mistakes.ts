export interface MistakeCard {
  id: string
  studySetId: string
  term: string
  reading: string
  definition: string
  example?: string | null
  exampleTranslation?: string | null
  jlptLevel?: string | null
  wordType?: string | null
  studySet?: { id: string; name: string } | null
  tags: Array<{ id: string; name: string; color: string }>
  srsData: {
    id: string
    status: string
    easeFactor: number
    interval: number
    repetitions: number
    correctCount: number
    incorrectCount: number
    lastReviewDate?: Date | string | null
  }
  stats?: {
    totalAttempts: number
    accuracy: number
    incorrectCount: number
  }
}

export type MistakeReviewMode = "Flashcard" | "Learn" | "Write"
