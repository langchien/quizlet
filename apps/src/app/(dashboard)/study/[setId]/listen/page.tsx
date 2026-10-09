"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Headphones,
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronLeft,
  Lightbulb,
  HelpCircle,
  Gauge,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StudySummary } from "@/components/study/study-summary"
import { useTTS } from "@/hooks/useTTS"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { isStudyAnswerCorrect } from "@/lib/study-matcher"

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
  studySet?: { id: string; name: string } | null
}

export default function ListenStudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = (params.setId || params.id) as string

  const { speak, isPlaying } = useTTS()

  const [cards, setCards] = React.useState<CardItem[]>([])
  const [setName, setSetName] = React.useState("")
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Current Card & Answer State
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [userTyped, setUserTyped] = React.useState("")
  const [failedAttempts, setFailedAttempts] = React.useState(0)
  const [status, setStatus] = React.useState<
    "listening" | "correct" | "incorrect" | "revealed"
  >("listening")
  const [playbackRate, setPlaybackRate] = React.useState<number>(1.0)

  // Results
  const [correctCards, setCorrectCards] = React.useState<CardItem[]>([])
  const [incorrectCards, setIncorrectCards] = React.useState<CardItem[]>([])
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [totalDuration, setTotalDuration] = React.useState(0)

  const startTimeRef = React.useRef<number>(0)
  const cardStartTimeRef = React.useRef<number>(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Tải danh sách thẻ và bắt đầu session
  const initSession = React.useCallback(async () => {
    setLoading(true)
    setIsCompleted(false)
    setCurrentIndex(0)
    setUserTyped("")
    setFailedAttempts(0)
    setStatus("listening")
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
          mode: "Listen",
          shuffle: true,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCards(data.cards || [])
        setSessionId(data.session?.id || null)
        if (data.cards?.length > 0 && data.cards[0].studySet?.name) {
          setSetName(data.cards[0].studySet.name)
        }
      } else {
        toast.error("Không thể tải danh sách thẻ nghe.")
        router.push(`/sets/${setId}`)
      }
    } catch (err) {
      console.error("Lỗi khởi tạo session Listen:", err)
      toast.error("Lỗi kết nối máy chủ.")
    } finally {
      setLoading(false)
      cardStartTimeRef.current = Date.now()
    }
  }, [setId, router])

  React.useEffect(() => {
    initSession()
  }, [initSession])

  const currentCard = cards[currentIndex]

  // Tự động phát âm khi chuyển sang thẻ mới
  React.useEffect(() => {
    if (currentCard && status === "listening" && !loading) {
      const timer = setTimeout(() => {
        speak(currentCard.term, playbackRate)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, currentCard, status, loading, speak, playbackRate])

  // Focus ô input
  React.useEffect(() => {
    if (status === "listening") {
      inputRef.current?.focus()
    }
  }, [currentIndex, status])


  // Phát âm lại thẻ hiện tại
  const handlePlayAudio = React.useCallback(
    (customRate?: number) => {
      if (currentCard) {
        speak(currentCard.term, customRate ?? playbackRate)
      }
    },
    [currentCard, speak, playbackRate]
  )

  // Kiểm tra đáp án người dùng đã gõ
  const handleCheckAnswer = async () => {
    if (!currentCard || status !== "listening" || !userTyped.trim()) return

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
      handlePlayAudio()

      try {
        await fetch("/api/study/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            cardId: currentCard.id,
            isCorrect: true,
            userAnswer: userTyped,
            timeTaken,
          }),
        })
      } catch (err) {
        console.error("Lỗi ghi nhận câu trả lời:", err)
      }
    } else {
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)

      if (newAttempts >= 3) {
        setStatus("revealed")
        setIncorrectCards((prev) => [...prev, currentCard])
        handlePlayAudio()

        try {
          await fetch("/api/study/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              cardId: currentCard.id,
              isCorrect: false,
              userAnswer: userTyped,
              timeTaken,
            }),
          })
        } catch (err) {
          console.error("Lỗi ghi nhận câu trả lời sai:", err)
        }
      } else {
        toast.error(`Chưa chính xác! Còn ${3 - newAttempts} lần thử.`)
      }
    }
  }

  // Bỏ qua / Tiết lộ đáp án
  const handleGiveUp = async () => {
    if (!currentCard || status !== "listening") return

    setStatus("revealed")
    setIncorrectCards((prev) => [...prev, currentCard])
    handlePlayAudio()

    try {
      await fetch("/api/study/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          cardId: currentCard.id,
          isCorrect: false,
          userAnswer: userTyped || "(Bỏ qua)",
          timeTaken: 1,
        }),
      })
    } catch (err) {
      console.error("Lỗi khi bỏ qua câu hỏi:", err)
    }
  }

  // Chuyển sang câu tiếp theo
  const handleNextCard = () => {
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1)
      setUserTyped("")
      setFailedAttempts(0)
      setStatus("listening")
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

      fetch("/api/study/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          studySetId: setId,
          mode: "Listen",
          duration: totalSecs,
          totalCards: cards.length,
          correctCards: correctCount,
          incorrectCards: incorrectCount,
          score,
        }),
      }).catch((err) => console.error("Lỗi kết thúc session Listen:", err))

      setIsCompleted(true)
    }
  }

  // Phím tắt bàn phím
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !(e.target instanceof HTMLInputElement) &&
        status === "listening"
      ) {
        e.preventDefault()
        handlePlayAudio()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handlePlayAudio, status])

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang khởi tạo chế độ Luyện nghe (Listen)...
        </p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-8 text-center shadow-md">
        <Headphones className="text-muted-foreground mx-auto mb-3 size-12" />
        <h3 className="text-foreground text-lg font-bold">Chưa có thẻ nào</h3>
        <p className="text-muted-foreground mt-1 mb-6 text-xs">
          Bộ thẻ này trống. Hãy thêm thẻ trước khi luyện nghe.
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
          mode="Listen"
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
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
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
            <span className="font-black text-cyan-500">{currentIndex + 1}</span>{" "}
            / {cards.length}
          </div>
          <div className="bg-muted h-2.5 w-32 overflow-hidden rounded-full sm:w-48">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Mode Label */}
        <div className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
          <Headphones className="size-3.5" />
          <span className="hidden sm:inline">Luyện nghe</span>
        </div>
      </div>

      {/* Main Listening Box */}
      <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8">
        {/* Speed & Audio Controls Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Gauge className="text-muted-foreground size-3.5" />
            <span className="text-muted-foreground text-xs font-medium">
              Tốc độ:
            </span>
            {[0.5, 0.8, 1.0, 1.2].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setPlaybackRate(r)
                  handlePlayAudio(r)
                }}
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-bold transition-colors",
                  playbackRate === r
                    ? "bg-cyan-500 text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {r}x
              </button>
            ))}
          </div>

          {currentCard.jlptLevel && (
            <Badge variant="outline" className="text-[10px]">
              {currentCard.jlptLevel}
            </Badge>
          )}
        </div>

        {/* Big Audio Speaker Action Button */}
        <div className="my-8 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={() => handlePlayAudio()}
            className={cn(
              "group relative flex size-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 sm:size-28",
              isPlaying && "ring-4 ring-cyan-500/40"
            )}
            title="Nhấn để nghe phát âm (Phím Cách)"
          >
            <Volume2
              className={cn(
                "size-10 transition-transform sm:size-12",
                isPlaying && "animate-pulse"
              )}
            />
          </button>

          {/* Soundwave animation bars */}
          <div className="mt-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full bg-cyan-500 transition-all duration-150",
                  isPlaying ? "h-6 animate-bounce" : "h-1 opacity-30"
                )}
                style={{
                  animationDelay: `${i * 80}ms`,
                  animationDuration: "400ms",
                }}
              />
            ))}
          </div>

          <p className="text-muted-foreground mt-2 text-xs font-medium">
            Nhấn vào loa để nghe lại (hoặc ấn phím Cách)
          </p>
        </div>

        {/* Hints Display based on failed attempts */}
        {failedAttempts > 0 && status === "listening" && (
          <div className="mx-auto mb-6 max-w-md space-y-2 rounded-2xl bg-amber-500/10 p-3.5 text-xs text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-2 font-bold">
              <Lightbulb className="size-4 shrink-0" />
              <span>Gợi ý:</span>
            </div>
            {failedAttempts === 1 && (
              <p>
                Từ này bắt đầu bằng ký tự: &quot;
                <b>{currentCard.term.charAt(0)}</b>&quot; (Gồm{" "}
                {currentCard.term.length} ký tự)
              </p>
            )}
            {failedAttempts >= 2 && (
              <div className="space-y-1">
                <p>
                  Cách đọc Hiragana: <b>{currentCard.reading}</b>
                </p>
                <p>
                  Ý nghĩa tiếng Việt: <i>{currentCard.definition}</i>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Typing Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (status === "listening") {
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
              placeholder="Gõ từ tiếng Nhật nghe được..."
              value={userTyped}
              onChange={(e) => setUserTyped(e.target.value)}
              disabled={status !== "listening"}
              autoFocus
              className={cn(
                "font-japanese h-14 rounded-2xl pr-12 text-center text-xl font-bold shadow-inner transition-all",
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

          {status === "listening" && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGiveUp}
                className="text-muted-foreground h-12 rounded-2xl px-4 text-xs font-semibold"
              >
                <HelpCircle className="mr-1 size-4" />
                <span>Bỏ qua</span>
              </Button>

              <Button
                type="submit"
                disabled={!userTyped.trim()}
                className="h-12 flex-1 rounded-2xl bg-cyan-600 font-bold text-white shadow-md hover:bg-cyan-700"
              >
                Kiểm tra (Enter)
              </Button>
            </div>
          )}
        </form>

        {/* Feedback Bar & Revealed Answer */}
        {status !== "listening" && (
          <div className="border-border/80 bg-muted/60 animate-in fade-in-0 mx-auto mt-6 max-w-md rounded-2xl border p-4 text-center">
            {status === "correct" ? (
              <div className="space-y-1 text-emerald-600 dark:text-emerald-400">
                <div className="text-base font-black">
                  🎉 Giỏi lắm! Bạn đã nghe chính xác!
                </div>
                <div className="font-japanese text-xl font-bold">
                  {currentCard.term} ({currentCard.reading})
                </div>
                <div className="text-muted-foreground text-xs">
                  {currentCard.definition}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  ❌ Đáp án chính xác là:
                </div>
                <div className="bg-background border-border/80 rounded-xl border p-3">
                  <div className="font-japanese text-foreground text-2xl font-black">
                    {currentCard.term}
                  </div>
                  <div className="font-japanese text-muted-foreground text-sm font-semibold">
                    {currentCard.reading}
                  </div>
                  <div className="text-foreground mt-1 text-xs">
                    {currentCard.definition}
                  </div>
                </div>
              </div>
            )}

            {currentCard.example && (
              <div className="bg-background/80 font-japanese text-muted-foreground mt-3 rounded-xl p-2.5 text-xs italic">
                Ví dụ: {currentCard.example}
              </div>
            )}

            <Button
              onClick={handleNextCard}
              className="mt-4 h-11 w-full gap-2 rounded-xl bg-cyan-600 font-bold text-white shadow-xs hover:bg-cyan-700"
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
