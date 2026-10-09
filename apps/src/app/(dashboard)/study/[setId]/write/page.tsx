"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  Pencil,
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronLeft,
  Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StudySummary } from "@/components/study/study-summary"
import { useTTS } from "@/hooks/useTTS"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { isStudyAnswerCorrect } from "@/lib/study-matcher"
import {
  startStudySessionAction,
  answerCardAction,
  endStudySessionAction,
} from "@/actions/study"

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
}

export default function WriteStudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = (params.setId || params.id) as string

  const { speak } = useTTS()

  const [cards, setCards] = React.useState<CardItem[]>([])
  const [setName, setSetName] = React.useState("")
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Current State
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [userTyped, setUserTyped] = React.useState("")
  const [failedAttempts, setFailedAttempts] = React.useState(0)
  const [status, setStatus] = React.useState<
    "typing" | "correct" | "incorrect" | "revealed"
  >("typing")

  // Results
  const [correctCards, setCorrectCards] = React.useState<CardItem[]>([])
  const [incorrectCards, setIncorrectCards] = React.useState<CardItem[]>([])
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [totalDuration, setTotalDuration] = React.useState(0)

  const startTimeRef = React.useRef<number>(0)
  const cardStartTimeRef = React.useRef<number>(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const searchParams = useSearchParams()
  const isReverseParam = searchParams.get("reverse") === "true"
  const isShuffleParam = searchParams.get("shuffle") !== "false"
  const statusParam = searchParams.get("status") || "All"
  const tagParam = searchParams.get("tag")

  // Bắt đầu session
  const initSession = React.useCallback(async () => {
    setLoading(true)
    setIsCompleted(false)
    setCurrentIndex(0)
    setUserTyped("")
    setFailedAttempts(0)
    setStatus("typing")
    setCorrectCards([])
    setIncorrectCards([])
    startTimeRef.current = Date.now()
    cardStartTimeRef.current = Date.now()

    try {
      const res = await startStudySessionAction({
        studySetId: setId,
        mode: "Write",
        shuffle: isShuffleParam,
        reverse: isReverseParam,
        filterByStatus:
          (statusParam as "New" | "Learning" | "Review" | "Mastered" | "All") ||
          "All",
        filterByTags: tagParam ? [tagParam] : [],
      })

      if (res.success && res.data) {
        setCards(res.data.cards as unknown as CardItem[])
        setSessionId(res.data.session.id)
        if (res.data.cards.length > 0 && res.data.cards[0].studySet?.name) {
          setSetName(res.data.cards[0].studySet.name)
        }
      } else {
        toast.error(res.error || "Không thể tải danh sách thẻ.")
        router.push(`/sets/${setId}`)
      }
    } catch (err) {
      console.error("Error starting write session:", err)
      toast.error("Lỗi kết nối máy chủ.")
    } finally {
      setLoading(false)
      cardStartTimeRef.current = Date.now()
    }
  }, [setId, router, isReverseParam, isShuffleParam, statusParam, tagParam])

  React.useEffect(() => {
    initSession()
  }, [initSession])

  React.useEffect(() => {
    if (status === "typing") {
      inputRef.current?.focus()
    }
  }, [currentIndex, status])

  const currentCard = cards[currentIndex]

  // Kiểm tra đáp án
  const handleCheckAnswer = async () => {
    if (!currentCard || status !== "typing" || !userTyped.trim()) return

    const timeTaken = Math.max(
      1,
      Math.round((Date.now() - cardStartTimeRef.current) / 1000)
    )
    const isMatch = isStudyAnswerCorrect({
      userAnswer: userTyped,
      card: currentCard,
      isReverse: false,
    })

    if (isMatch) {
      setStatus("correct")
      setCorrectCards((prev) => [...prev, currentCard])
      speak(currentCard.term)

      try {
        await answerCardAction({
          sessionId: sessionId || undefined,
          cardId: currentCard.id,
          isCorrect: true,
          userAnswer: userTyped,
          timeTaken,
        })
      } catch (err) {
        console.error("Error submitting answer:", err)
      }
    } else {
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)

      if (newAttempts >= 3) {
        setStatus("revealed")
        setIncorrectCards((prev) => [...prev, currentCard])

        try {
          await answerCardAction({
            sessionId: sessionId || undefined,
            cardId: currentCard.id,
            isCorrect: false,
            userAnswer: userTyped,
            timeTaken,
          })
        } catch (err) {
          console.error("Error submitting answer:", err)
        }
      } else {
        toast.error(`Chưa chính xác! Còn ${3 - newAttempts} lần thử.`)
      }
    }
  }

  // Override: "Đáp án của tôi đúng"
  const handleOverrideCorrect = async () => {
    if (!currentCard) return
    setStatus("correct")
    setIncorrectCards((prev) => prev.filter((c) => c.id !== currentCard.id))
    setCorrectCards((prev) => [...prev, currentCard])
    toast.success("Đã đánh dấu là đúng!")

    try {
      await answerCardAction({
        sessionId: sessionId || undefined,
        cardId: currentCard.id,
        isCorrect: true,
        userAnswer: userTyped,
        timeTaken: 1,
      })
    } catch (err) {
      console.error("Error overriding answer:", err)
    }
  }

  // Sang thẻ tiếp theo
  const handleNextCard = () => {
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1)
      setUserTyped("")
      setFailedAttempts(0)
      setStatus("typing")
      cardStartTimeRef.current = Date.now()
    } else {
      const totalSecs = Math.max(
        1,
        Math.round((Date.now() - startTimeRef.current) / 1000)
      )
      setTotalDuration(totalSecs)
      const correctCount = correctCards.length
      const incorrectCount = incorrectCards.length
      const score = Math.round((correctCount / cards.length) * 100)

      endStudySessionAction({
        sessionId: sessionId || undefined,
        studySetId: setId,
        mode: "Write",
        duration: totalSecs,
        totalCards: cards.length,
        correctCards: correctCount,
        incorrectCards: incorrectCount,
        score,
      }).catch((err) => console.error("Error ending session:", err))

      setIsCompleted(true)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang khởi tạo chế độ Viết (Write)...
        </p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-8 text-center shadow-md">
        <Pencil className="text-muted-foreground mx-auto mb-3 size-12" />
        <h3 className="text-foreground text-lg font-bold">Chưa có thẻ nào</h3>
        <p className="text-muted-foreground mt-1 mb-6 text-xs">
          Bộ thẻ này trống. Hãy thêm thẻ trước khi học.
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
          mode="Write"
          totalCards={cards.length}
          correctCards={correctCards.length}
          incorrectCards={incorrectCards.length}
          durationSeconds={totalDuration}
          onRestart={initSession}
        />
      </div>
    )
  }

  const progressPct = Math.round(((currentIndex + 1) / cards.length) * 100)

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      {/* Top Header Controls */}
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
            <span className="font-black text-amber-500">
              {currentIndex + 1}
            </span>{" "}
            / {cards.length}
          </div>
          <div className="bg-muted h-2.5 w-32 overflow-hidden rounded-full sm:w-48">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Mode Label */}
        <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
          <Pencil className="size-3.5" />
          <span className="hidden sm:inline">Luyện viết</span>
        </div>
      </div>

      {/* Main Write Card Container */}
      <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8">
        {/* Card Header Info */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-[11px] font-bold">
              Nhìn định nghĩa gõ tiếng Nhật
            </span>

            {currentCard.jlptLevel && (
              <Badge variant="outline" className="text-[10px]">
                {currentCard.jlptLevel}
              </Badge>
            )}
          </div>

          <button
            type="button"
            onClick={() => speak(currentCard.term)}
            className="text-primary hover:bg-primary/10 rounded-full p-2 transition-colors"
            title="Phát âm tiếng Nhật"
          >
            <Volume2 className="size-4" />
          </button>
        </div>

        {/* Prompt Section */}
        <div className="my-6 text-center">
          <div className="text-muted-foreground mb-1 text-xs font-medium">
            Nghĩa tiếng Việt (Hãy gõ từ tiếng Nhật tương ứng):
          </div>
          <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            {currentCard.definition}
          </h2>

          {/* Example Context if available */}
          {currentCard.example && (
            <div className="bg-muted/40 mx-auto mt-4 max-w-lg rounded-2xl p-3 text-left">
              <div className="font-japanese text-foreground text-xs font-medium">
                {currentCard.example}
              </div>
              {currentCard.exampleTranslation && (
                <div className="text-muted-foreground mt-0.5 text-[11px]">
                  {currentCard.exampleTranslation}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hint Box */}
        {failedAttempts > 0 && status === "typing" && (
          <div className="mx-auto mb-4 flex max-w-md items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
            <Lightbulb className="size-4 shrink-0" />
            <div>
              {failedAttempts === 1 ? (
                <span>
                  {currentCard.reading ? (
                    <>
                      Gợi ý cách đọc: <b>{currentCard.reading}</b>
                    </>
                  ) : (
                    <>
                      Gợi ý: Bắt đầu bằng chữ &quot;
                      <b>{currentCard.term.charAt(0)}</b>&quot;
                    </>
                  )}
                </span>
              ) : (
                <span>
                  Gợi ý từ vựng: <b>{currentCard.term}</b> (
                  {currentCard.reading})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Input Field Section */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (status === "typing") {
              handleCheckAnswer()
            } else {
              handleNextCard()
            }
          }}
          className="mx-auto max-w-md space-y-4"
        >
          <div className="relative">
            <Input
              ref={inputRef}
              placeholder="Gõ tiếng Nhật (Kanji hoặc Hiragana)..."
              value={userTyped}
              onChange={(e) => setUserTyped(e.target.value)}
              disabled={status !== "typing"}
              autoFocus
              className={cn(
                "h-14 rounded-2xl pr-12 text-center text-lg font-bold shadow-inner transition-all",
                status === "correct" &&
                  "border-emerald-500 bg-emerald-500/10 text-emerald-600",
                status === "revealed" &&
                  "border-rose-500 bg-rose-500/10 text-rose-600"
              )}
            />
            {status === "correct" && (
              <CheckCircle2 className="absolute top-1/2 right-4 size-6 -translate-y-1/2 text-emerald-500" />
            )}
            {status === "revealed" && (
              <XCircle className="absolute top-1/2 right-4 size-6 -translate-y-1/2 text-rose-500" />
            )}
          </div>

          {status === "typing" && (
            <Button
              type="submit"
              disabled={!userTyped.trim()}
              className="h-12 w-full rounded-2xl font-bold shadow-md"
            >
              Kiểm tra đáp án (Enter)
            </Button>
          )}
        </form>

        {/* Feedback / Revealed Answer Box */}
        {status !== "typing" && (
          <div className="border-border/80 bg-muted/60 animate-in fade-in-0 mx-auto mt-6 max-w-md rounded-2xl border p-4 text-center">
            {status === "correct" ? (
              <div className="space-y-1 text-emerald-600 dark:text-emerald-400">
                <div className="text-base font-extrabold">
                  🎉 Chính xác! Làm rất tốt!
                </div>
                <div className="font-japanese text-sm font-semibold">
                  {currentCard.term} ({currentCard.reading})
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  ❌ Đáp án chính xác là:
                </div>
                <div className="bg-background border-border/80 rounded-xl border p-3">
                  <div className="font-japanese text-foreground text-2xl font-black">
                    {currentCard.term}
                  </div>
                  <div className="font-japanese text-muted-foreground text-sm font-medium">
                    {currentCard.reading}
                  </div>
                  <div className="text-foreground mt-1 text-xs">
                    {currentCard.definition}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleOverrideCorrect}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Đáp án của tôi đúng
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={handleNextCard}
              className="mt-4 h-11 w-full gap-2 rounded-xl font-bold shadow-xs"
            >
              <span>Tiếp tục (Enter)</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
