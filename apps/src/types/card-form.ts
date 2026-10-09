export interface TagItem {
  id: string
  name: string
  color: string
}

export interface EditCardItem {
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
  tags?: TagItem[]
}

export const WORD_TYPES = [
  { value: "Noun", label: "Danh từ (Noun)" },
  { value: "Verb", label: "Động từ (Verb)" },
  { value: "IAdjective", label: "Tính từ -i (い形容詞)" },
  { value: "NaAdjective", label: "Tính từ -na (な形容詞)" },
  { value: "Adverb", label: "Phó từ (Adverb)" },
  { value: "Kanji", label: "Hán tự (Kanji)" },
  { value: "Grammar", label: "Ngữ pháp (Grammar)" },
  { value: "Other", label: "Khác (Other)" },
] as const
