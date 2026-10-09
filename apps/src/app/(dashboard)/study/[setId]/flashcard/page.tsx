"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import {
  Volume2,
  Rotate3D,
  Shuffle,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  ChevronLeft,
  RotateCcw,
  Keyboard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudySummary } from "@/components/study/study-summary"
import { useTTS } from "@/hooks/useTTS"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { ShortcutsCheatsheetModal } from "@/components/modals/shortcuts-cheatsheet-modal"
import { useAuthStore } from "@/stores/useAuthStore"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CardItem {
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

export default function FlashcardStudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = (params.setId || params.id) as string

  const { user } = useAuthStore()
  const userSettings =
    user?.settings && typeof user.settings === "object"
      ? (user.settings as Record<string, unknown>)
      : {}

  const defaultTtsRate = userSettings.ttsRate
    ? Number(userSettings.ttsRate)
    : 0.9
  const defaultVoiceURI = userSettings.ttsVoice
    ? String(userSettings.ttsVoice)
    : undefined

  const { speak } = useTTS({
    defaultRate: defaultTtsRate,
    defaultVoiceURI: defaultVoiceURI,
  })

  const [cards, setCards] = React.useState<CardItem[]>([])
  const [setName, setSetName] = React.useState("")
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [cheatsheetOpen, setCheatsheetOpen] = React.useState(false)

  // Study state
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isFlipped, setIsFlipped] = React.useState(false)
  const [isReverse, setIsReverse] = React.useState(false) // Mặt trước là Định nghĩa, mặt sau là Term
  const [isShuffle, setIsShuffle] = React.useState(false)
  const [isAutoPlay, setIsAutoPlay] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // Session results
  const [correctCards, setCorrectCards] = React.useState<CardItem[]>([])
  const [incorrectCards, setIncorrectCards] = React.useState<CardItem[]>([])
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [totalDuration, setTotalDuration] = React.useState(0)

  const startTimeRef = React.useRef<number>(0)
  const cardStartTimeRef = React.useRef<number>(0)

  // Tải danh sách thẻ và bắt đầu session
  const initSession = React.useCallback(
    async (shuffleMode = false) => {
      setLoading(true)
      setIsCompleted(false)
      setCurrentIndex(0)
      setIsFlipped(false)
      setCorrectCards([])
      setIncorrectCards([])
      startTimeRef.current = Date.now()
      cardStartTimeRef.current = Date.now()

      try {
        const res = await fetch("/api/study/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studySetId: setId,
            mode: "Flashcard",
            shuffle: shuffleMode,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          setCards(data.cards)
          setSessionId(data.session?.id || null)
          if (data.cards.length > 0 && data.cards[0].studySet?.name) {
            setSetName(data.cards[0].studySet.name)
          }
        } else {
          toast.error("Không thể tải danh sách thẻ học.")
          router.push(`/sets/${setId}`)
        }
      } catch (err) {
        console.error("Error starting flashcard session:", err)
        toast.error("Lỗi kết nối máy chủ.")
      } finally {
        setLoading(false)
        cardStartTimeRef.current = Date.now()
      }
    },
    [setId, router]
  )

  React.useEffect(() => {
    initSession(isShuffle)
  }, [initSession, isShuffle])

  const currentCard = cards[currentIndex]

  // Lật thẻ
  const handleFlip = React.useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  // Phát âm thẻ hiện tại
  const handleSpeak = React.useCallback(() => {
    if (currentCard) {
      speak(currentCard.term)
    }
  }, [currentCard, speak])

  // Trả lời thẻ (Biết / Chưa biết)
  const handleAnswer = React.useCallback(
    async (isCorrect: boolean) => {
      if (!currentCard) return

      const timeTaken = Math.max(
        1,
        Math.round((Date.now() - cardStartTimeRef.current) / 1000)
      )

      if (isCorrect) {
        setCorrectCards((prev) => [...prev, currentCard])
      } else {
        setIncorrectCards((prev) => [...prev, currentCard])
      }

      // Gửi kết quả về server
      try {
        await fetch("/api/study/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            cardId: currentCard.id,
            isCorrect,
            timeTaken,
          }),
        })
      } catch (err) {
        console.error("Error recording answer:", err)
      }

      // Chuyển thẻ tiếp theo hoặc hoàn thành
      if (currentIndex + 1 < cards.length) {
        setIsFlipped(false)
        setCurrentIndex((prev) => prev + 1)
        cardStartTimeRef.current = Date.now()
      } else {
        // Kết thúc session
        const totalSecs = Math.max(
          1,
          Math.round((Date.now() - startTimeRef.current) / 1000)
        )
        setTotalDuration(totalSecs)
        const finalCorrect = correctCards.length + (isCorrect ? 1 : 0)
        const finalIncorrect = incorrectCards.length + (isCorrect ? 0 : 1)
        const score = Math.round((finalCorrect / cards.length) * 100)

        try {
          await fetch("/api/study/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              studySetId: setId,
              mode: "Flashcard",
              duration: totalSecs,
              totalCards: cards.length,
              correctCards: finalCorrect,
              incorrectCards: finalIncorrect,
              score,
            }),
          })
        } catch (err) {
          console.error("Error ending session:", err)
        }

        setIsCompleted(true)
        setIsAutoPlay(false)
      }
    },
    [
      currentCard,
      sessionId,
      currentIndex,
      cards.length,
      correctCards.length,
      incorrectCards.length,
      setId,
    ]
  )

  // Điều hướng trước / sau
  const handlePrev = React.useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      setCurrentIndex((prev) => prev - 1)
      cardStartTimeRef.current = Date.now()
    }
  }, [currentIndex])

  const handleNext = React.useCallback(() => {
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false)
      setCurrentIndex((prev) => prev + 1)
      cardStartTimeRef.current = Date.now()
    }
  }, [currentIndex, cards.length])

  // Auto-play logic
  React.useEffect(() => {
    if (!isAutoPlay || isCompleted || !currentCard) return

    handleSpeak()

    const flipTimer = setTimeout(() => {
      setIsFlipped(true)
    }, 2500)

    const nextTimer = setTimeout(() => {
      if (currentIndex + 1 < cards.length) {
        setIsFlipped(false)
        setCurrentIndex((prev) => prev + 1)
        cardStartTimeRef.current = Date.now()
      } else {
        setIsCompleted(true)
        setIsAutoPlay(false)
      }
    }, 5500)

    return () => {
      clearTimeout(flipTimer)
      clearTimeout(nextTimer)
    }
  }, [
    isAutoPlay,
    currentIndex,
    isCompleted,
    currentCard,
    handleSpeak,
    cards.length,
  ])

  // Keyboard Shortcuts chuẩn hoá
  useKeyboardShortcuts(
    {
      onFlip: handleFlip,
      onPrev: handlePrev,
      onNext: handleNext,
      onAnswerAgain: () => handleAnswer(false),
      onAnswerGood: () => handleAnswer(true),
      onShuffle: () => setIsShuffle((prev) => !prev),
      onReverse: () => setIsReverse((prev) => !prev),
      onSpeak: handleSpeak,
      onOpenCheatsheet: () => setCheatsheetOpen(true),
    },
    { enabled: !isCompleted && !loading }
  )

  // Ôn lại các thẻ làm sai
  const handleReviewMistakes = () => {
    if (incorrectCards.length === 0) return
    setCards(incorrectCards)
    setCorrectCards([])
    setIncorrectCards([])
    setCurrentIndex(0)
    setIsFlipped(false)
    setIsCompleted(false)
    startTimeRef.current = Date.now()
    cardStartTimeRef.current = Date.now()
  }

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang khởi tạo Flashcard...
        </p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-8 text-center shadow-md">
        <Layers className="text-muted-foreground mx-auto mb-3 size-12" />
        <h3 className="text-foreground text-lg font-bold">
          Không có thẻ nào để học
        </h3>
        <p className="text-muted-foreground mt-1 mb-6 text-xs">
          Bộ thẻ này chưa có thẻ từ vựng nào. Hãy thêm thẻ trước khi bắt đầu.
        </p>
        <Button onClick={() => router.push(`/sets/${setId}`)}>
          Quay về bộ thẻ
        </Button>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="py-8">
        <StudySummary
          setId={setId}
          setName={setName}
          mode="Flashcard"
          totalCards={cards.length}
          correctCards={correctCards.length}
          incorrectCards={incorrectCards.length}
          durationSeconds={totalDuration}
          onRestart={() => initSession(isShuffle)}
          onReviewMistakes={handleReviewMistakes}
          hasMistakes={incorrectCards.length > 0}
        />
      </div>
    )
  }

  const progressPct = Math.round(((currentIndex + 1) / cards.length) * 100)

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between">
        <Link
          href={`/sets/${setId}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ChevronLeft className="size-4" />
          <span>Thoát</span>
        </Link>

        {/* Progress Display */}
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground text-xs font-bold">
            <span className="text-foreground text-sm font-black">
              {currentIndex + 1}
            </span>{" "}
            / {cards.length}
          </div>
          <div className="bg-muted h-2 w-32 overflow-hidden rounded-full sm:w-48">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Quick Utility Icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsShuffle((prev) => !prev)}
            className={cn(
              "rounded-lg p-2 transition-colors",
              isShuffle
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title="Xáo trộn thứ tự"
          >
            <Shuffle className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsReverse((prev) => !prev)}
            className={cn(
              "rounded-lg p-2 transition-colors",
              isReverse
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title="Đổi mặt thẻ (Hỏi định nghĩa trước)"
          >
            <Rotate3D className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsAutoPlay((prev) => !prev)}
            className={cn(
              "rounded-lg p-2 transition-colors",
              isAutoPlay
                ? "bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title="Tự động phát thẻ (Auto-play)"
          >
            {isAutoPlay ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setCheatsheetOpen(true)}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
            title="Bảng phím tắt (?)"
          >
            <Keyboard className="size-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
            title="Toàn màn hình"
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* 3D FLASHCARD CONTAINER */}
      <div className="perspective-1000 relative mx-auto h-[380px] w-full max-w-2xl sm:h-[420px]">
        <div
          onClick={handleFlip}
          className={cn(
            "transform-style-3d relative h-full w-full cursor-pointer rounded-3xl transition-transform duration-500 select-none",
            isFlipped && "rotate-y-180"
          )}
        >
          {/* MẶT TRƯỚC (FRONT) */}
          <div className="border-border bg-card absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-xl backface-hidden sm:p-8">
            {/* Top Front Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentCard.jlptLevel && (
                  <Badge variant="outline" className="text-xs font-bold">
                    {currentCard.jlptLevel}
                  </Badge>
                )}
                {currentCard.wordType && (
                  <span className="text-muted-foreground text-xs">
                    {currentCard.wordType}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSpeak()
                }}
                className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full p-2.5 transition-colors"
                title="Phát âm tiếng Nhật (Phím A)"
              >
                <Volume2 className="size-4" />
              </button>
            </div>

            {/* Front Content */}
            <div className="my-auto text-center">
              {!isReverse ? (
                <>
                  <h2 className="font-japanese text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl">
                    {currentCard.term}
                  </h2>
                  <p className="font-japanese text-muted-foreground mt-3 text-lg font-medium sm:text-xl">
                    {currentCard.reading}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-foreground text-2xl leading-relaxed font-bold sm:text-3xl">
                    {currentCard.definition}
                  </h2>
                  {currentCard.exampleTranslation && (
                    <p className="text-muted-foreground mt-3 text-sm italic">
                      &quot;{currentCard.exampleTranslation}&quot;
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Bottom Front Hint */}
            <div className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Nhấn vào thẻ hoặc phím Cách (Space) để lật</span>
            </div>
          </div>

          {/* MẶT SAU (BACK) */}
          <div className="border-border bg-card absolute inset-0 flex rotate-y-180 flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-xl backface-hidden sm:p-8">
            {/* Top Back Info */}
            <div className="flex items-center justify-between">
              <span className="bg-primary/10 text-primary rounded-md px-2.5 py-0.5 text-xs font-bold">
                Đáp án
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSpeak()
                }}
                className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full p-2 transition-colors"
                title="Phát âm tiếng Nhật"
              >
                <Volume2 className="size-4" />
              </button>
            </div>

            {/* Back Content */}
            <div className="my-auto space-y-4 text-center">
              {!isReverse ? (
                <>
                  <div className="text-foreground text-2xl leading-snug font-extrabold sm:text-3xl">
                    {currentCard.definition}
                  </div>

                  {currentCard.example && (
                    <div className="bg-muted/40 mx-auto max-w-lg rounded-2xl p-3 text-left">
                      <div className="font-japanese text-foreground text-sm font-semibold">
                        {currentCard.example}
                      </div>
                      {currentCard.exampleTranslation && (
                        <div className="text-muted-foreground mt-1 text-xs">
                          {currentCard.exampleTranslation}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="font-japanese text-foreground text-4xl font-black">
                    {currentCard.term}
                  </div>
                  <div className="font-japanese text-muted-foreground text-lg">
                    {currentCard.reading}
                  </div>
                </>
              )}

              {/* Kanji Specific Info if available */}
              {(currentCard.onReading ||
                currentCard.kunReading ||
                currentCard.strokeCount) && (
                <div className="border-border/60 mx-auto flex max-w-sm flex-wrap items-center justify-center gap-3 border-t pt-2 text-[11px]">
                  {currentCard.strokeCount && (
                    <span className="text-muted-foreground">
                      Số nét: <b>{currentCard.strokeCount}</b>
                    </span>
                  )}
                  {currentCard.onReading && (
                    <span className="text-muted-foreground">
                      Âm On: <b>{currentCard.onReading}</b>
                    </span>
                  )}
                  {currentCard.kunReading && (
                    <span className="text-muted-foreground">
                      Âm Kun: <b>{currentCard.kunReading}</b>
                    </span>
                  )}
                </div>
              )}

              {currentCard.imageUrl && (
                <div className="relative mx-auto h-20 w-32 overflow-hidden rounded-xl">
                  <Image
                    src={currentCard.imageUrl}
                    alt={currentCard.term}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            {/* Bottom Back Controls */}
            <div className="text-muted-foreground text-center text-xs">
              Đánh giá mức độ ghi nhớ của bạn
            </div>
          </div>
        </div>
      </div>

      {/* Main Bottom Actions Bar */}
      <div className="mx-auto flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-1 rounded-xl"
            title="Thẻ trước (Phím ←)"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Trước</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleFlip}
            className="gap-1.5 rounded-xl font-bold"
          >
            <RotateCcw className="size-3.5" />
            <span>Lật thẻ</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex + 1 >= cards.length}
            className="gap-1 rounded-xl"
            title="Thẻ sau (Phím →)"
          >
            <span className="hidden sm:inline">Sau</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* Rating buttons */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleAnswer(false)}
            className="gap-1.5 rounded-xl border-rose-500/30 font-semibold text-rose-600 shadow-2xs hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-400"
            title="Chưa nhớ (Phím 1)"
          >
            <X className="size-4" />
            <span>Chưa biết (1)</span>
          </Button>

          <Button
            onClick={() => handleAnswer(true)}
            className="gap-1.5 rounded-xl bg-emerald-600 font-semibold text-white shadow-xs hover:bg-emerald-700"
            title="Đã nhớ (Phím 2)"
          >
            <Check className="size-4" />
            <span>Đã biết (2)</span>
          </Button>
        </div>
      </div>

      {/* Keyboard shortcuts helper cheatsheet */}
      <div className="border-border/40 text-muted-foreground mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-4 border-t pt-4 text-[11px]">
        <span>
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            Space
          </kbd>{" "}
          Lật thẻ
        </span>
        <span>
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            ← / →
          </kbd>{" "}
          Chuyển thẻ
        </span>
        <span>
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            1
          </kbd>{" "}
          Chưa biết
        </span>
        <span>
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            2
          </kbd>{" "}
          Đã biết
        </span>
        <span>
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            A
          </kbd>{" "}
          Phát âm
        </span>
      </div>

      <ShortcutsCheatsheetModal
        open={cheatsheetOpen}
        onOpenChange={setCheatsheetOpen}
      />
    </div>
  )
}
