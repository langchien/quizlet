export interface LearnCardItem {
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
  tags?: Array<{ id: string; name: string; color: string }>
  studySet?: { id: string; name: string } | null
}

export type LearnQuestionType = "multiple-choice" | "true-false" | "written"

export interface LearnQuestionData {
  card: LearnCardItem
  type: LearnQuestionType
  prompt: string
  subPrompt?: string
  correctAnswer: string
  options?: string[]
  tfPair?: { isTrue: boolean; displayedAnswer: string }
}
