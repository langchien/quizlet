"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  BrainCircuit,
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronLeft,
  Lightbulb,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StudySummary } from "@/components/study/study-summary"
import { useTTS } from "@/hooks/useTTS"
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
  tags?: Array<{ id: string; name: string; color: string }>
  studySet?: { id: string; name: string } | null
}

type QuestionType = "multiple-choice" | "true-false" | "written"

interface QuestionData {
  card: CardItem
  type: QuestionType
  prompt: string
  subPrompt?: string
  correctAnswer: string
  options?: string[] // Dành cho Multiple Choice
  tfPair?: { isTrue: boolean; displayedAnswer: string } // Dành cho True/False
}

export default function LearnStudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = (params.setId || params.id) as string

  const { speak } = useTTS()

  const [allCards, setAllCards] = React.useState<CardItem[]>([])
  const [queue, setQueue] = React.useState<CardItem[]>([])
  const [setName, setSetName] = React.useState("")
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Current Question State
  const [currentQuestion, setCurrentQuestion] =
    React.useState<QuestionData | null>(null)
  const [selectedOption, setSelectedOption] = React.useState<string | null>(
    null
  )
  const [writtenAnswer, setWrittenAnswer] = React.useState("")
  const [showFeedback, setShowFeedback] = React.useState(false)
  const [isCurrentCorrect, setIsCurrentCorrect] = React.useState(false)
  const [writtenFailedAttempts, setWrittenFailedAttempts] = React.useState(0)

  // Session Statistics
  const [correctCardIds, setCorrectCardIds] = React.useState<Set<string>>(
    new Set()
  )
  const [incorrectCardIds, setIncorrectCardIds] = React.useState<Set<string>>(
    new Set()
  )
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [totalDuration, setTotalDuration] = React.useState(0)

  const startTimeRef = React.useRef<number>(0)
  const cardStartTimeRef = React.useRef<number>(0)

  // Reverse mode toggle
  const [isReverse] = React.useState(false)

  // Tạo câu hỏi ngẫu nhiên từ thẻ hiện tại
  const generateQuestion = React.useCallback(
    (card: CardItem, cardList: CardItem[], reverse: boolean): QuestionData => {
      const types: QuestionType[] = ["multiple-choice", "true-false", "written"]
      const randomType =
        cardList.length < 4
          ? "written"
          : types[Math.floor(Math.random() * types.length)]

      const prompt = reverse ? card.definition : card.term
      const subPrompt = reverse ? undefined : card.reading
      const correctAnswer = reverse ? card.term : card.definition

      if (randomType === "multiple-choice") {
        const otherCards = cardList.filter((c) => c.id !== card.id)
        const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random())
        const distractors = shuffledOthers
          .slice(0, 3)
          .map((c) => (reverse ? c.term : c.definition))

        const options = [...distractors, correctAnswer].sort(
          () => 0.5 - Math.random()
        )

        return {
          card,
          type: "multiple-choice",
          prompt,
          subPrompt,
          correctAnswer,
          options,
        }
      } else if (randomType === "true-false") {
        const isTrue = Math.random() > 0.5
        let displayedAnswer = correctAnswer

        if (!isTrue && cardList.length > 1) {
          const otherCards = cardList.filter((c) => c.id !== card.id)
          const randomOther =
            otherCards[Math.floor(Math.random() * otherCards.length)]
          displayedAnswer = reverse ? randomOther.term : randomOther.definition
        }

        return {
          card,
          type: "true-false",
          prompt,
          subPrompt,
          correctAnswer,
          tfPair: { isTrue, displayedAnswer },
        }
      } else {
        return {
          card,
          type: "written",
          prompt,
          subPrompt,
          correctAnswer,
        }
      }
    },
    []
  )

  // Khởi tạo phiên học
  const initSession = React.useCallback(async () => {
    setLoading(true)
    setIsCompleted(false)
    setShowFeedback(false)
    setSelectedOption(null)
    setWrittenAnswer("")
    setWrittenFailedAttempts(0)
    setCorrectCardIds(new Set())
    setIncorrectCardIds(new Set())
    startTimeRef.current = Date.now()
    cardStartTimeRef.current = Date.now()

    try {
      const res = await fetch("/api/study/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studySetId: setId,
          mode: "Learn",
          shuffle: true,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const cardsData: CardItem[] = data.cards || []
        setAllCards(cardsData)
        setQueue([...cardsData])
        setSessionId(data.session?.id || null)

        if (cardsData.length > 0) {
          if (cardsData[0].studySet?.name) {
            setSetName(cardsData[0].studySet.name)
          }
          const firstQ = generateQuestion(cardsData[0], cardsData, isReverse)
          setCurrentQuestion(firstQ)
        }
      } else {
        toast.error("Không thể tải danh sách câu hỏi.")
        router.push(`/sets/${setId}`)
      }
    } catch (err) {
      console.error("Error loading learn session:", err)
      toast.error("Lỗi kết nối máy chủ.")
    } finally {
      setLoading(false)
      cardStartTimeRef.current = Date.now()
    }
  }, [setId, router, isReverse, generateQuestion])

  React.useEffect(() => {
    initSession()
  }, [initSession])

  // Xử lý nộp câu trả lời
  const handleSelectAnswer = React.useCallback(
    async (userAnswer: string, isCorrectAnswer: boolean) => {
      if (showFeedback || !currentQuestion) return

      const timeTaken = Math.max(
        1,
        Math.round((Date.now() - cardStartTimeRef.current) / 1000)
      )
      setSelectedOption(userAnswer)
      setIsCurrentCorrect(isCorrectAnswer)
      setShowFeedback(true)

      const card = currentQuestion.card

      if (isCorrectAnswer) {
        setCorrectCardIds((prev) => new Set(prev).add(card.id))
        speak(card.term)
      } else {
        setIncorrectCardIds((prev) => new Set(prev).add(card.id))
      }

      try {
        await fetch("/api/study/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            cardId: card.id,
            isCorrect: isCorrectAnswer,
            userAnswer,
            timeTaken,
          }),
        })
      } catch (err) {
        console.error("Error recording answer:", err)
      }
    },
    [showFeedback, currentQuestion, speak, sessionId]
  )

  // Kiểm tra câu trả lời dạng Written
  const handleCheckWritten = React.useCallback(() => {
    if (!currentQuestion || showFeedback) return
    const inputClean = writtenAnswer.trim().toLowerCase()
    const targetClean = currentQuestion.correctAnswer.trim().toLowerCase()
    const readingClean = currentQuestion.card.reading.trim().toLowerCase()

    const isMatch =
      inputClean === targetClean || (!isReverse && inputClean === readingClean)

    if (isMatch) {
      handleSelectAnswer(writtenAnswer, true)
    } else {
      const nextFail = writtenFailedAttempts + 1
      setWrittenFailedAttempts(nextFail)
      if (nextFail >= 2) {
        handleSelectAnswer(writtenAnswer, false)
      } else {
        toast.error("Chưa chính xác, hãy thử lại!")
      }
    }
  }, [
    currentQuestion,
    showFeedback,
    writtenAnswer,
    isReverse,
    handleSelectAnswer,
    writtenFailedAttempts,
  ])

  // Chuyển sang câu hỏi tiếp theo
  const handleNextQuestion = React.useCallback(() => {
    if (!currentQuestion) return

    const currentCard = currentQuestion.card
    const nextQueue = [...queue.slice(1)]

    // Nếu trả lời sai, thêm thẻ này vào cuối hàng đợi để học lại!
    if (!isCurrentCorrect) {
      nextQueue.push(currentCard)
    }

    setQueue(nextQueue)
    setShowFeedback(false)
    setSelectedOption(null)
    setWrittenAnswer("")
    setWrittenFailedAttempts(0)

    if (nextQueue.length > 0) {
      const nextQ = generateQuestion(nextQueue[0], allCards, isReverse)
      setCurrentQuestion(nextQ)
      cardStartTimeRef.current = Date.now()
    } else {
      const totalSecs = Math.max(
        1,
        Math.round((Date.now() - startTimeRef.current) / 1000)
      )
      setTotalDuration(totalSecs)
      const correctCount = correctCardIds.size
      const incorrectCount = incorrectCardIds.size
      const total = allCards.length
      const score = total > 0 ? Math.round((correctCount / total) * 100) : 0

      fetch("/api/study/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          studySetId: setId,
          mode: "Learn",
          duration: totalSecs,
          totalCards: total,
          correctCards: correctCount,
          incorrectCards: incorrectCount,
          score,
        }),
      }).catch((err) => console.error("Error ending session:", err))

      setIsCompleted(true)
    }
  }, [
    currentQuestion,
    queue,
    isCurrentCorrect,
    generateQuestion,
    allCards,
    isReverse,
    correctCardIds.size,
    incorrectCardIds.size,
    sessionId,
    setId,
  ])

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang khởi tạo chế độ học thích ứng (Learn)...
        </p>
      </div>
    )
  }

  if (allCards.length === 0) {
    return (
      <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-8 text-center shadow-md">
        <BrainCircuit className="text-muted-foreground mx-auto mb-3 size-12" />
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
          mode="Learn"
          totalCards={allCards.length}
          correctCards={correctCardIds.size}
          incorrectCards={incorrectCardIds.size}
          durationSeconds={totalDuration}
          onRestart={initSession}
        />
      </div>
    )
  }

  if (!currentQuestion) return null

  const progressPct = Math.round((correctCardIds.size / allCards.length) * 100)

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

        {/* Progress & Remaining */}
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground text-xs font-bold">
            <span className="font-black text-emerald-500">
              {correctCardIds.size}
            </span>{" "}
            / {allCards.length} đã thuộc
          </div>
          <div className="bg-muted h-2.5 w-32 overflow-hidden rounded-full sm:w-48">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Mode label */}
        <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <BrainCircuit className="size-3.5" />
          <span className="hidden sm:inline">Học thích ứng</span>
        </div>
      </div>

      {/* Main Question Box */}
      <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8">
        {/* Question Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-[11px] font-bold">
              {currentQuestion.type === "multiple-choice"
                ? "Trắc nghiệm 4 lựa chọn"
                : currentQuestion.type === "true-false"
                  ? "Đúng hay Sai?"
                  : "Gõ câu trả lời"}
            </span>

            {currentQuestion.card.jlptLevel && (
              <Badge variant="outline" className="text-[10px]">
                {currentQuestion.card.jlptLevel}
              </Badge>
            )}
          </div>

          <button
            type="button"
            onClick={() => speak(currentQuestion.card.term)}
            className="text-primary hover:bg-primary/10 rounded-full p-2 transition-colors"
            title="Phát âm tiếng Nhật"
          >
            <Volume2 className="size-4" />
          </button>
        </div>

        {/* Prompt Presentation */}
        <div className="my-6 text-center">
          <div className="text-muted-foreground mb-1 text-xs font-medium">
            {isReverse ? "Nghĩa tiếng Việt:" : "Thuật ngữ tiếng Nhật:"}
          </div>
          <h2 className="font-japanese text-foreground text-3xl font-black tracking-tight sm:text-4xl">
            {currentQuestion.prompt}
          </h2>
          {currentQuestion.subPrompt && (
            <p className="font-japanese text-muted-foreground mt-2 text-base font-medium">
              {currentQuestion.subPrompt}
            </p>
          )}
        </div>

        {/* 1. DẠNG TRẮC NGHIỆM (MULTIPLE CHOICE) */}
        {currentQuestion.type === "multiple-choice" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {currentQuestion.options?.map((opt, idx) => {
              const isChosen = selectedOption === opt
              const isCorrectOpt = opt === currentQuestion.correctAnswer

              let style =
                "border-border bg-background hover:border-primary/50 hover:bg-muted/50 text-foreground"
              if (showFeedback) {
                if (isCorrectOpt) {
                  style =
                    "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                } else if (isChosen && !isCorrectOpt) {
                  style =
                    "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                } else {
                  style = "opacity-40 border-border bg-background"
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={showFeedback}
                  onClick={() => handleSelectAnswer(opt, isCorrectOpt)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition-all duration-150",
                    style
                  )}
                >
                  <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                  {showFeedback && isCorrectOpt && (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  )}
                  {showFeedback && isChosen && !isCorrectOpt && (
                    <XCircle className="size-4 shrink-0 text-rose-500" />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* 2. DẠNG ĐÚNG / SAI (TRUE / FALSE) */}
        {currentQuestion.type === "true-false" && (
          <div className="space-y-6">
            <div className="border-border/60 bg-muted/30 rounded-2xl border p-4 text-center">
              <span className="text-muted-foreground text-xs">
                Có phải có nghĩa là:
              </span>
              <div className="text-foreground mt-1 text-xl font-bold">
                {currentQuestion.tfPair?.displayedAnswer}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                disabled={showFeedback}
                onClick={() => {
                  const isCorrectAnswer =
                    currentQuestion.tfPair?.isTrue === false
                  handleSelectAnswer("false", isCorrectAnswer)
                }}
                className={cn(
                  "h-14 gap-2 rounded-2xl border-rose-500/30 text-base font-bold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
                  showFeedback &&
                    !currentQuestion.tfPair?.isTrue &&
                    "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                )}
              >
                <X className="size-5" />
                <span>Sai ❌</span>
              </Button>

              <Button
                size="lg"
                disabled={showFeedback}
                onClick={() => {
                  const isCorrectAnswer =
                    currentQuestion.tfPair?.isTrue === true
                  handleSelectAnswer("true", isCorrectAnswer)
                }}
                className={cn(
                  "h-14 gap-2 rounded-2xl bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700",
                  showFeedback &&
                    currentQuestion.tfPair?.isTrue &&
                    "bg-emerald-600"
                )}
              >
                <Check className="size-5" />
                <span>Đúng ✅</span>
              </Button>
            </div>
          </div>
        )}

        {/* 3. DẠNG GÕ TỪ (WRITTEN) */}
        {currentQuestion.type === "written" && (
          <div className="space-y-4">
            {writtenFailedAttempts >= 1 && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                <Lightbulb className="size-4 shrink-0" />
                <span>
                  Gợi ý: Bắt đầu bằng chữ &quot;
                  <b>{currentQuestion.correctAnswer.charAt(0)}</b>&quot;
                </span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleCheckWritten()
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Gõ đáp án vào đây..."
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                disabled={showFeedback}
                autoFocus
                className="h-12 text-base font-semibold"
              />
              <Button
                type="submit"
                disabled={showFeedback || !writtenAnswer.trim()}
                className="h-12 px-6 font-bold"
              >
                Kiểm tra
              </Button>
            </form>
          </div>
        )}

        {/* Feedback Bar & Explanation */}
        {showFeedback && (
          <div className="border-border/80 bg-muted/60 animate-in fade-in-0 mt-6 rounded-2xl border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                {isCurrentCorrect ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 size-5 shrink-0 text-rose-500" />
                )}
                <div>
                  <div className="text-foreground text-sm font-bold">
                    {isCurrentCorrect
                      ? "Chính xác! Làm tốt lắm!"
                      : "Chưa đúng rồi!"}
                  </div>
                  {!isCurrentCorrect && (
                    <div className="text-muted-foreground mt-0.5 text-xs">
                      Đáp án đúng là:{" "}
                      <span className="text-foreground font-bold">
                        {currentQuestion.correctAnswer}
                      </span>
                    </div>
                  )}
                  {currentQuestion.card.example && (
                    <div className="text-muted-foreground font-japanese mt-1 text-xs italic">
                      Ví dụ: {currentQuestion.card.example}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleNextQuestion}
                className="gap-1.5 self-end rounded-xl font-bold sm:self-center"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
