export interface MatchCardItem {
  id: string
  studySetId: string
  term: string
  reading: string
  definition: string
  example?: string | null
  exampleTranslation?: string | null
  imageUrl?: string | null
  audioUrl?: string | null
  jlptLevel?: string | null
  wordType?: string | null
  studySet?: { id: string; name: string } | null
}

export interface MatchTile {
  tileId: string
  cardId: string
  type: "term" | "definition"
  text: string
  subText?: string
  isMatched: boolean
  isWrong: boolean
}
