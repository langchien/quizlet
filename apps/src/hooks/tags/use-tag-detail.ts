"use client"

import * as React from "react"

export interface CardWithSet {
  id: string
  studySetId: string
  studySet: {
    id: string
    name: string
  }
  term: string
  reading: string
  definition: string
  example?: string | null
  exampleTranslation?: string | null
  jlptLevel?: string | null
  wordType?: string | null
  tags: Array<{ id: string; name: string; color: string }>
}

interface UseTagDetailOptions {
  initialCards: CardWithSet[]
}

export function useTagDetail({ initialCards }: UseTagDetailOptions) {
  const [cards] = React.useState<CardWithSet[]>(initialCards)

  const speakJapanese = React.useCallback((text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ja-JP"
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  return {
    cards,
    speakJapanese,
  }
}
