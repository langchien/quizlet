"use client"

import * as React from "react"
import {
  TagDetailBreadcrumb,
  TagDetailHeader,
  TagDetailCardList,
} from "@/components/tags"
import { useTagDetail, type CardWithSet } from "@/hooks/tags"

interface TagDetailClientProps {
  tag: {
    id: string
    name: string
    color: string
  }
  initialCards: CardWithSet[]
}

export function TagDetailClient({ tag, initialCards }: TagDetailClientProps) {
  const { cards, speakJapanese } = useTagDetail({ initialCards })

  return (
    <div className="flex flex-col gap-6">
      <TagDetailBreadcrumb tagName={tag.name} />
      <TagDetailHeader tag={tag} cardCount={cards.length} />
      <TagDetailCardList
        tagName={tag.name}
        cards={cards}
        onSpeak={speakJapanese}
      />
    </div>
  )
}
