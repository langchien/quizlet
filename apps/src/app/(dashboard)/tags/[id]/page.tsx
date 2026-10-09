"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Tag as TagIcon,
  ArrowLeft,
  Volume2,
  BookOpen,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

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

export default function TagCardsPage() {
  const params = useParams()
  const router = useRouter()
  const tagId = params.id as string

  const [tag, setTag] = React.useState<{
    id: string
    name: string
    color: string
  } | null>(null)
  const [cards, setCards] = React.useState<CardWithSet[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`/api/tags/${tagId}/cards`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setTag(data.tag)
          setCards(data.cards || [])
        } else {
          toast.error("Không tìm thấy nhãn")
          router.push("/tags")
        }
      })
      .catch((err) => console.error("Error loading cards by tag:", err))
      .finally(() => setLoading(false))
  }, [tagId, router])

  const speakJapanese = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ja-JP"
      window.speechSynthesis.speak(utterance)
    }
  }

  if (loading || !tag) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-card h-8 w-40 rounded-xl" />
        <div className="bg-card h-32 rounded-2xl" />
      </div>
    )
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
                  {/* Set Name Badge */}
                  <div className="mb-2 flex items-center justify-between">
                    <Link
                      href={`/sets/${card.studySetId}`}
                      className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold hover:underline"
                    >
                      <BookOpen className="size-3" />
                      <span>{card.studySet.name}</span>
                    </Link>

                    {card.jlptLevel && (
                      <Badge variant="outline" className="text-[10px]">
                        JLPT {card.jlptLevel}
                      </Badge>
                    )}
                  </div>

                  {/* Term & Reading */}
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => speakJapanese(card.term)}
                      className="text-muted-foreground hover:bg-muted hover:text-primary mt-0.5 rounded p-1 transition-colors"
                      title="Phát âm"
                    >
                      <Volume2 className="size-4" />
                    </button>
                    <div>
                      <div className="text-foreground font-japanese text-base font-bold">
                        {card.term}
                      </div>
                      <div className="text-muted-foreground font-japanese text-xs">
                        {card.reading}
                      </div>
                    </div>
                  </div>

                  {/* Definition */}
                  <div className="text-foreground mt-2 text-xs font-medium">
                    {card.definition}
                  </div>

                  {/* Example */}
                  {card.example && (
                    <div className="bg-muted/30 font-japanese text-muted-foreground mt-2 rounded-xl p-2 text-xs">
                      <div>{card.example}</div>
                      {card.exampleTranslation && (
                        <div className="text-foreground/70 mt-0.5 text-[11px]">
                          {card.exampleTranslation}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer link to set */}
                <div className="border-border/50 mt-4 flex justify-end border-t pt-2">
                  <Link
                    href={`/sets/${card.studySetId}`}
                    className="text-primary text-[11px] font-semibold hover:underline"
                  >
                    Xem trong bộ thẻ →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
