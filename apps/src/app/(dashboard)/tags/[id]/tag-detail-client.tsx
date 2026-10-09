"use client"

import * as React from "react"
import Link from "next/link"
import {
  Tag as TagIcon,
  ArrowLeft,
  Volume2,
  BookOpen,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CardWithSet {
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

interface TagDetailClientProps {
  tag: {
    id: string
    name: string
    color: string
  }
  initialCards: CardWithSet[]
}

export function TagDetailClient({ tag, initialCards }: TagDetailClientProps) {
  const cards = initialCards

  const speakJapanese = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ja-JP"
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <Link
          href="/tags"
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Quản lý nhãn</span>
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-semibold">{tag.name}</span>
      </div>

      {/* Tag Header */}
      <div
        className="rounded-3xl border p-6 sm:p-8"
        style={{
          borderColor: `${tag.color}40`,
          backgroundColor: `${tag.color}10`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex size-12 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: tag.color }}
          >
            <TagIcon className="size-6" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-extrabold sm:text-3xl">
              {tag.name}
            </h1>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Đang gắn trên <strong>{cards.length}</strong> thẻ từ vựng xuyên
              suốt các bộ thẻ
            </p>
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        <h2 className="text-foreground text-base font-bold">
          Danh sách thẻ học gắn nhãn &quot;{tag.name}&quot;
        </h2>

        {cards.length === 0 ? (
          <div className="border-border text-muted-foreground rounded-2xl border border-dashed py-12 text-center text-xs">
            Chưa có thẻ nào được gắn nhãn này. Hãy mở bộ thẻ và gán nhãn vào
            thẻ!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="border-border bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-4 shadow-2xs transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-foreground text-lg font-bold">
                        {card.term}
                      </span>
                      {card.reading && card.reading !== card.term && (
                        <span className="text-muted-foreground text-xs">
                          [{card.reading}]
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => speakJapanese(card.reading || card.term)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-1.5 transition-colors"
                      title="Phát âm tiếng Nhật"
                    >
                      <Volume2 className="size-4" />
                    </button>
                  </div>

                  <p className="text-foreground/90 mt-2 text-sm">
                    {card.definition}
                  </p>

                  {card.example && (
                    <div className="bg-muted/40 mt-3 rounded-xl p-2.5 text-xs">
                      <div className="text-foreground font-medium">
                        {card.example}
                      </div>
                      {card.exampleTranslation && (
                        <div className="text-muted-foreground mt-0.5">
                          {card.exampleTranslation}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-border/40 mt-4 flex items-center justify-between border-t pt-3">
                  <Link
                    href={`/sets/${card.studySetId}`}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <BookOpen className="size-3.5" />
                    <span className="max-w-[180px] truncate">
                      {card.studySet.name}
                    </span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    {card.jlptLevel && (
                      <Badge variant="outline" className="text-[10px]">
                        {card.jlptLevel}
                      </Badge>
                    )}
                    {card.wordType && (
                      <Badge variant="secondary" className="text-[10px]">
                        {card.wordType}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
