"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  CheckSquare,
  Volume2,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  BookOpen,
  Trophy,
  AlertTriangle,
  Play,
  ListChecks,
  Sparkles,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  studySet?: { id: string; name: string } | null
}

type QuestionKind = "multiple-choice" | "true-false" | "written"

interface TestQuestion {
  id: string
  card: CardItem
  kind: QuestionKind
  prompt: string
  subPrompt?: string
  correctAnswer: string
  options?: string[] // Trắc nghiệm 4 lựa chọn
  tfPair?: { isTrue: boolean; displayedAnswer: string } // Đúng/Sai
  userAnswer?: string
  isCorrect?: boolean
}

type TestPhase = "config" | "testing" | "result"

export default function TestStudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.id as string

  const { speak } = useTTS()

  // Dữ liệu bộ thẻ
  const [allCards, setAllCards] = React.useState<CardItem[]>([])
  const [setName, setSetName] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [sessionId, setSessionId] = React.useState<string | null>(null)

  // Cấu hình bài kiểm tra
  const [testPhase, setTestPhase] = React.useState<TestPhase>("config")
  const [questionCount, setQuestionCount] = React.useState<number>(20)
  const [allowMultipleChoice, setAllowMultipleChoice] = React.useState(true)
  const [allowTrueFalse, setAllowTrueFalse] = React.useState(true)
  const [allowWritten, setAllowWritten] = React.useState(true)
  const [timeLimitMinutes, setTimeLimitMinutes] = React.useState<number>(0) // 0 = Không giới hạn
  const [isReverse, setIsReverse] = React.useState(false)

  // Trạng thái bài kiểm tra
  const [questions, setQuestions] = React.useState<TestQuestion[]>([])
  const [activeQuestionIndex, setActiveQuestionIndex] = React.useState(0)
  const [timeLeftSeconds, setTimeLeftSeconds] = React.useState<number | null>(
    null
  )
  const [confirmSubmitOpen, setConfirmSubmitOpen] = React.useState(false)
  const [exitConfirmOpen, setExitConfirmOpen] = React.useState(false)

  // Thống kê kết quả
  const [totalDuration, setTotalDuration] = React.useState(0)
  const [score, setScore] = React.useState(0)
  const [correctCount, setCorrectCount] = React.useState(0)
  const [incorrectCount, setIncorrectCount] = React.useState(0)
  const [personalBestScore, setPersonalBestScore] = React.useState<
    number | null
  >(null)

  const startTimeRef = React.useRef<number>(0)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Tải danh sách thẻ ban đầu
  const loadInitialCards = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/sets/${setId}`)
      if (res.ok) {
        const data = await res.json()
        setAllCards(data.cards || [])
        setSetName(data.name || "")
        if (data.cards && data.cards.length > 0) {
          setQuestionCount(Math.min(20, data.cards.length))
        }

        // Đọc Personal Best từ localStorage
        const storedPB = localStorage.getItem(`nihomemo_test_pb_${setId}`)
        if (storedPB) {
          setPersonalBestScore(Number(storedPB))
        }
      } else {
        toast.error("Không tìm thấy bộ thẻ.")
        router.push("/library")
      }
    } catch (err) {
      console.error("Lỗi tải bộ thẻ:", err)
      toast.error("Lỗi kết nối máy chủ.")
    } finally {
      setLoading(false)
    }
  }, [setId, router])

  React.useEffect(() => {
    loadInitialCards()
  }, [loadInitialCards])

  // Chuẩn bị các câu hỏi cho bài kiểm tra
  const generateQuestions = React.useCallback(
    (
      cards: CardItem[],
      count: number,
      types: QuestionKind[],
      reverse: boolean
    ): TestQuestion[] => {
      // Xáo trộn danh sách thẻ
      const shuffledCards = [...cards].sort(() => 0.5 - Math.random())
      const selectedCards = shuffledCards.slice(0, count)

      return selectedCards.map((card, idx) => {
        // Chọn ngẫu nhiên dạng câu hỏi trong các dạng đã chọn
        const kind = types[Math.floor(Math.random() * types.length)]
        const prompt = reverse ? card.definition : card.term
        const subPrompt = reverse ? undefined : card.reading
        const correctAnswer = reverse ? card.term : card.definition

        if (kind === "multiple-choice" && cards.length >= 4) {
          const others = cards.filter((c) => c.id !== card.id)
          const shuffledOthers = [...others].sort(() => 0.5 - Math.random())
          const distractors = shuffledOthers
            .slice(0, 3)
            .map((c) => (reverse ? c.term : c.definition))
          const options = [...distractors, correctAnswer].sort(
            () => 0.5 - Math.random()
          )

          return {
            id: `q_${idx}_${card.id}`,
            card,
            kind,
            prompt,
            subPrompt,
            correctAnswer,
            options,
          }
        } else if (kind === "true-false" && cards.length >= 2) {
          const isTrue = Math.random() > 0.5
          let displayedAnswer = correctAnswer

          if (!isTrue) {
            const others = cards.filter((c) => c.id !== card.id)
            const randomOther =
              others[Math.floor(Math.random() * others.length)]
            displayedAnswer = reverse
              ? randomOther.term
              : randomOther.definition
          }

          return {
            id: `q_${idx}_${card.id}`,
            card,
            kind: "true-false",
            prompt,
            subPrompt,
            correctAnswer,
            tfPair: { isTrue, displayedAnswer },
          }
        } else {
          return {
            id: `q_${idx}_${card.id}`,
            card,
            kind: "written",
            prompt,
            subPrompt,
            correctAnswer,
          }
        }
      })
    },
    []
  )

  // Bắt đầu làm bài kiểm tra
  const handleStartTest = async () => {
    // Kiểm tra đã chọn ít nhất 1 dạng câu hỏi
    const enabledTypes: QuestionKind[] = []
    if (allowMultipleChoice) enabledTypes.push("multiple-choice")
    if (allowTrueFalse) enabledTypes.push("true-false")
    if (allowWritten) enabledTypes.push("written")

    if (enabledTypes.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dạng câu hỏi.")
      return
    }

    const actualCount = Math.min(questionCount, allCards.length)
    if (actualCount === 0) {
      toast.error("Bộ thẻ không có từ vựng nào.")
      return
    }

    const generated = generateQuestions(
      allCards,
      actualCount,
      enabledTypes,
      isReverse
    )
    setQuestions(generated)
    setActiveQuestionIndex(0)
    startTimeRef.current = Date.now()

    if (timeLimitMinutes > 0) {
      setTimeLeftSeconds(timeLimitMinutes * 60)
    } else {
      setTimeLeftSeconds(null)
    }

    // Khởi tạo phiên học trên server
    try {
      const res = await fetch("/api/study/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studySetId: setId,
          mode: "Test",
          shuffle: true,
          limit: actualCount,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSessionId(data.session?.id || null)
      }
    } catch (err) {
      console.error("Lỗi tạo session:", err)
    }

    setTestPhase("testing")
  }

  // Chuẩn hoá chuỗi để so sánh
  const normalize = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .replace(/[\s\u3000]+/g, "")
      .replace(/[、。，,.]/g, "")

  // Xử lý nộp bài thi
  const handleSubmitTest = React.useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    const duration = Math.max(
      1,
      Math.round((Date.now() - startTimeRef.current) / 1000)
    )
    setTotalDuration(duration)

    // Chấm điểm từng câu hỏi
    let correct = 0
    let incorrect = 0

    const gradedQuestions = questions.map((q) => {
      let isCorrect = false

      if (!q.userAnswer) {
        isCorrect = false
      } else if (q.kind === "multiple-choice") {
        isCorrect = q.userAnswer === q.correctAnswer
      } else if (q.kind === "true-false") {
        const expected = q.tfPair?.isTrue ? "true" : "false"
        isCorrect = q.userAnswer === expected
      } else if (q.kind === "written") {
        const inputNorm = normalize(q.userAnswer)
        const targetNorm = normalize(q.correctAnswer)
        const readingNorm = normalize(q.card.reading)
        isCorrect =
          inputNorm === targetNorm || (!isReverse && inputNorm === readingNorm)
      }

      if (isCorrect) correct++
      else incorrect++

      return { ...q, isCorrect }
    })

    const finalScore = Math.round((correct / questions.length) * 100)
    setQuestions(gradedQuestions)
    setCorrectCount(correct)
    setIncorrectCount(incorrect)
    setScore(finalScore)

    // Cập nhật Personal Best
    const currentPB = personalBestScore ?? 0
    if (finalScore > currentPB) {
      setPersonalBestScore(finalScore)
      localStorage.setItem(`nihomemo_test_pb_${setId}`, String(finalScore))
    }

    // Gửi kết quả về server
    try {
      await fetch("/api/study/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          studySetId: setId,
          mode: "Test",
          duration,
          totalCards: questions.length,
          correctCards: correct,
          incorrectCards: incorrect,
          score: finalScore,
        }),
      })
    } catch (err) {
      console.error("Lỗi gửi kết quả bài test:", err)
    }

    setConfirmSubmitOpen(false)
    setTestPhase("result")
  }, [questions, isReverse, personalBestScore, sessionId, setId])

  // Timer countdown
  React.useEffect(() => {
    if (testPhase !== "testing" || timeLeftSeconds === null) return

    if (timeLeftSeconds <= 0) {
      toast.warning("Đã hết thời gian làm bài! Đang tự động nộp bài...")
      handleSubmitTest()
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!)
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [testPhase, timeLeftSeconds, handleSubmitTest])

  // Đổi câu trả lời của 1 câu
  const handleAnswerQuestion = (qIndex: number, ans: string) => {
    setQuestions((prev) => {
      const updated = [...prev]
      updated[qIndex] = { ...updated[qIndex], userAnswer: ans }
      return updated
    })
  }

  // Đếm số câu đã trả lời
  const answeredCount = questions.filter(
    (q) => q.userAnswer !== undefined && q.userAnswer.trim() !== ""
  ).length

  // Định dạng thời gian (phút:giây)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang khởi tạo bài kiểm tra...
        </p>
      </div>
    )
  }

  if (allCards.length === 0) {
    return (
      <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-8 text-center shadow-md">
        <CheckSquare className="text-muted-foreground mx-auto mb-3 size-12" />
        <h3 className="text-foreground text-lg font-bold">
          Chưa có thẻ nào trong bộ này
        </h3>
        <p className="text-muted-foreground mt-1 mb-6 text-xs">
          Hãy thêm thẻ từ vựng vào bộ thẻ trước khi tạo bài kiểm tra.
        </p>
        <Button onClick={() => router.push(`/sets/${setId}`)}>
          Quay về bộ thẻ
        </Button>
      </div>
    )
  }

  // ==========================================
  // GIAI ĐOẠN 1: CẤU HÌNH BÀI KIỂM TRA (CONFIG)
  // ==========================================
  if (testPhase === "config") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pb-16">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href={`/sets/${setId}`}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            <ChevronLeft className="size-4" />
            <span>Về bộ thẻ</span>
          </Link>
          <Badge variant="outline" className="text-xs font-semibold">
            {setName}
          </Badge>
        </div>

        <div className="border-border bg-card overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md">
              <CheckSquare className="size-6" />
            </div>
            <div>
              <h1 className="text-foreground text-2xl font-extrabold tracking-tight">
                Thiết lập bài kiểm tra
              </h1>
              <p className="text-muted-foreground text-xs">
                Tuỳ chỉnh số lượng câu hỏi, dạng bài thi và thời gian theo ý
                bạn.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 1. Số lượng câu hỏi */}
            <div className="space-y-2.5">
              <Label className="text-foreground text-xs font-bold tracking-wider uppercase">
                1. Số lượng câu hỏi (Tổng {allCards.length} thẻ)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, allCards.length].map((num, i) => {
                  const label = i === 3 ? `Tất cả (${num})` : `${num} câu`
                  const isSelected = questionCount === num
                  return (
                    <Button
                      key={i}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setQuestionCount(num)}
                      className={cn(
                        "rounded-xl text-xs font-bold",
                        isSelected && "bg-purple-600 hover:bg-purple-700"
                      )}
                    >
                      {label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* 2. Dạng câu hỏi */}
            <div className="space-y-3">
              <Label className="text-foreground text-xs font-bold tracking-wider uppercase">
                2. Dạng câu hỏi bao gồm
              </Label>
              <div className="border-border/60 bg-muted/30 divide-border/40 divide-y rounded-2xl border p-4">
                <div className="flex items-center justify-between pb-3">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="type-mc"
                      className="text-foreground cursor-pointer text-sm font-semibold"
                    >
                      Trắc nghiệm 4 lựa chọn (Multiple Choice)
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Chọn 1 đáp án chính xác nhất trong 4 phương án.
                    </p>
                  </div>
                  <Checkbox
                    id="type-mc"
                    checked={allowMultipleChoice}
                    onCheckedChange={(c) => setAllowMultipleChoice(c === true)}
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="type-tf"
                      className="text-foreground cursor-pointer text-sm font-semibold"
                    >
                      Đúng / Sai (True or False)
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Xác định cặp từ vựng - ý nghĩa hiển thị là đúng hay sai.
                    </p>
                  </div>
                  <Checkbox
                    id="type-tf"
                    checked={allowTrueFalse}
                    onCheckedChange={(c) => setAllowTrueFalse(c === true)}
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="type-written"
                      className="text-foreground cursor-pointer text-sm font-semibold"
                    >
                      Điền từ / Tự luận (Written)
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Tự gõ chính xác từ vựng hoặc ý nghĩa vào ô trả lời.
                    </p>
                  </div>
                  <Checkbox
                    id="type-written"
                    checked={allowWritten}
                    onCheckedChange={(c) => setAllowWritten(c === true)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Giới hạn thời gian */}
            <div className="space-y-2.5">
              <Label className="text-foreground text-xs font-bold tracking-wider uppercase">
                3. Giới hạn thời gian
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Không giới hạn", mins: 0 },
                  { label: "5 phút", mins: 5 },
                  { label: "10 phút", mins: 10 },
                  { label: "20 phút", mins: 20 },
                ].map((item) => (
                  <Button
                    key={item.mins}
                    type="button"
                    variant={
                      timeLimitMinutes === item.mins ? "default" : "outline"
                    }
                    onClick={() => setTimeLimitMinutes(item.mins)}
                    className={cn(
                      "rounded-xl text-xs font-bold",
                      timeLimitMinutes === item.mins &&
                        "bg-purple-600 hover:bg-purple-700"
                    )}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 4. Đảo mặt câu hỏi */}
            <div className="border-border/60 bg-muted/30 flex items-center justify-between rounded-2xl border p-4">
              <div className="space-y-0.5">
                <Label
                  htmlFor="switch-reverse"
                  className="text-foreground cursor-pointer text-sm font-semibold"
                >
                  Chế độ đảo ngược (Reverse)
                </Label>
                <p className="text-muted-foreground text-xs">
                  Hiển thị định nghĩa tiếng Việt và yêu cầu chọn/gõ từ tiếng
                  Nhật.
                </p>
              </div>
              <Switch
                id="switch-reverse"
                checked={isReverse}
                onCheckedChange={setIsReverse}
              />
            </div>

            {/* Kỷ lục cá nhân nếu có */}
            {personalBestScore !== null && (
              <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 p-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Trophy className="size-4 shrink-0" />
                <span>
                  Điểm số cao nhất của bạn trong bộ thẻ này:{" "}
                  <b>{personalBestScore}%</b>
                </span>
              </div>
            )}

            {/* Start Test Button */}
            <Button
              size="lg"
              onClick={handleStartTest}
              className="h-13 w-full gap-2 rounded-2xl bg-purple-600 text-base font-bold text-white shadow-lg hover:bg-purple-700"
            >
              <Play className="size-5 fill-current" />
              <span>Bắt đầu làm bài kiểm tra</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // GIAI ĐOẠN 2: ĐANG LÀM BÀI KIỂM TRA (TESTING)
  // ==========================================
  if (testPhase === "testing") {
    const q = questions[activeQuestionIndex]
    const progressPct = Math.round((answeredCount / questions.length) * 100)

    return (
      <div className="mx-auto max-w-4xl space-y-6 pb-20">
        {/* Top Header Bar */}
        <div className="border-border bg-card/80 sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExitConfirmOpen(true)}
              className="text-muted-foreground hover:text-foreground h-8 gap-1 px-2 text-xs"
            >
              <ChevronLeft className="size-4" />
              <span>Thoát</span>
            </Button>

            <div className="border-border/60 hidden h-4 w-px border-r sm:block" />

            {/* Answered Counter */}
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold">
              <ListChecks className="text-primary size-4" />
              <span>
                Đã làm:{" "}
                <b className="text-foreground">
                  {answeredCount}/{questions.length}
                </b>
              </span>
            </div>
          </div>

          {/* Timer */}
          {timeLeftSeconds !== null && (
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold",
                timeLeftSeconds < 60
                  ? "animate-pulse bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  : "bg-muted text-foreground"
              )}
            >
              <Clock className="size-3.5" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <Button
            size="sm"
            onClick={() => setConfirmSubmitOpen(true)}
            className="h-8 gap-1.5 rounded-xl bg-purple-600 px-4 font-bold text-white shadow-xs hover:bg-purple-700"
          >
            <span>Nộp bài</span>
            <CheckSquare className="size-3.5" />
          </Button>
        </div>

        {/* Question Navigation Grid */}
        <div className="border-border bg-card/50 overflow-hidden rounded-2xl border p-3 shadow-2xs">
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-[11px] font-bold">
            <span>Danh sách câu hỏi</span>
            <span>{progressPct}% hoàn thành</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((item, idx) => {
              const isCurrent = idx === activeQuestionIndex
              const isAnswered =
                item.userAnswer !== undefined && item.userAnswer.trim() !== ""

              let style =
                "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              if (isAnswered) {
                style =
                  "border-purple-500/40 bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold"
              }
              if (isCurrent) {
                style =
                  "border-purple-600 bg-purple-600 text-white font-black ring-2 ring-purple-600/30"
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={cn(
                    "flex size-7.5 items-center justify-center rounded-lg border text-xs transition-all",
                    style
                  )}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Current Question Card */}
        {q && (
          <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                  Câu {activeQuestionIndex + 1} / {questions.length}
                </span>

                <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[11px] font-medium">
                  {q.kind === "multiple-choice"
                    ? "Trắc nghiệm"
                    : q.kind === "true-false"
                      ? "Đúng hay Sai"
                      : "Điền câu trả lời"}
                </span>

                {q.card.jlptLevel && (
                  <Badge variant="outline" className="text-[10px]">
                    {q.card.jlptLevel}
                  </Badge>
                )}
              </div>

              <button
                type="button"
                onClick={() => speak(q.card.term)}
                className="text-primary hover:bg-primary/10 rounded-full p-2 transition-colors"
                title="Phát âm tiếng Nhật"
              >
                <Volume2 className="size-4" />
              </button>
            </div>

            {/* Prompt */}
            <div className="my-6 text-center">
              <div className="text-muted-foreground mb-1 text-xs font-medium">
                {isReverse ? "Nghĩa tiếng Việt:" : "Thuật ngữ tiếng Nhật:"}
              </div>
              <h2 className="font-japanese text-foreground text-3xl font-black tracking-tight sm:text-4xl">
                {q.prompt}
              </h2>
              {q.subPrompt && (
                <p className="font-japanese text-muted-foreground mt-2 text-base font-medium">
                  {q.subPrompt}
                </p>
              )}
            </div>

            {/* 1. Trắc nghiệm (Multiple Choice) */}
            {q.kind === "multiple-choice" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {q.options?.map((opt, optIdx) => {
                  const isSelected = q.userAnswer === opt

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() =>
                        handleAnswerQuestion(activeQuestionIndex, opt)
                      }
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition-all duration-150",
                        isSelected
                          ? "border-purple-600 bg-purple-500/10 font-bold text-purple-700 shadow-xs ring-1 ring-purple-600 dark:text-purple-300"
                          : "border-border bg-background hover:bg-muted/50 text-foreground hover:border-purple-400"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold",
                          isSelected
                            ? "bg-purple-600 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1 leading-snug">{opt}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* 2. Đúng / Sai (True False) */}
            {q.kind === "true-false" && (
              <div className="space-y-6">
                <div className="border-border/60 bg-muted/30 rounded-2xl border p-4 text-center">
                  <span className="text-muted-foreground text-xs">
                    Có phải mang ý nghĩa là:
                  </span>
                  <div className="text-foreground mt-1 text-xl font-bold">
                    {q.tfPair?.displayedAnswer}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      handleAnswerQuestion(activeQuestionIndex, "false")
                    }
                    className={cn(
                      "h-14 rounded-2xl border-rose-500/30 text-base font-bold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
                      q.userAnswer === "false" &&
                        "border-rose-600 bg-rose-500/20 font-black text-rose-700 ring-2 ring-rose-500"
                    )}
                  >
                    <span>Sai ❌</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      handleAnswerQuestion(activeQuestionIndex, "true")
                    }
                    className={cn(
                      "h-14 rounded-2xl border-emerald-500/30 text-base font-bold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400",
                      q.userAnswer === "true" &&
                        "border-emerald-600 bg-emerald-500/20 font-black text-emerald-700 ring-2 ring-emerald-500"
                    )}
                  >
                    <span>Đúng ✅</span>
                  </Button>
                </div>
              </div>
            )}

            {/* 3. Tự luận (Written) */}
            {q.kind === "written" && (
              <div className="mx-auto max-w-md space-y-3">
                <Input
                  placeholder={
                    isReverse
                      ? "Gõ định nghĩa tiếng Việt..."
                      : "Gõ từ tiếng Nhật..."
                  }
                  value={q.userAnswer || ""}
                  onChange={(e) =>
                    handleAnswerQuestion(activeQuestionIndex, e.target.value)
                  }
                  autoFocus
                  className="h-13 rounded-2xl text-center text-lg font-bold shadow-inner"
                />
                <p className="text-muted-foreground text-center text-xs">
                  {isReverse
                    ? "Nhập câu dịch tiếng Việt"
                    : "Bạn có thể gõ Hiragana hoặc Kanji"}
                </p>
              </div>
            )}

            {/* Bottom Question Controls */}
            <div className="border-border/60 mt-8 flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={activeQuestionIndex === 0}
                onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
                className="gap-1 rounded-xl"
              >
                <ChevronLeft className="size-4" />
                <span>Câu trước</span>
              </Button>

              <span className="text-muted-foreground text-xs font-medium">
                Câu {activeQuestionIndex + 1} trên {questions.length}
              </span>

              {activeQuestionIndex + 1 < questions.length ? (
                <Button
                  size="sm"
                  onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
                  className="gap-1 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setConfirmSubmitOpen(true)}
                  className="gap-1 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                >
                  <span>Nộp bài</span>
                  <CheckSquare className="size-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Dialog Xác nhận nộp bài */}
        <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
          <DialogContent className="rounded-3xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                {answeredCount < questions.length ? (
                  <AlertTriangle className="size-5 text-amber-500" />
                ) : (
                  <CheckCircle2 className="size-5 text-emerald-500" />
                )}
                <span>Xác nhận nộp bài kiểm tra</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {answeredCount < questions.length ? (
                  <span className="font-semibold text-rose-500">
                    Bạn còn {questions.length - answeredCount} câu chưa làm bài!
                    Bạn có chắc chắn muốn nộp ngay không?
                  </span>
                ) : (
                  <span>
                    Bạn đã hoàn thành tất cả {questions.length} câu hỏi. Sẵn
                    sàng nhận kết quả chấm điểm?
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setConfirmSubmitOpen(false)}
                className="rounded-xl text-xs"
              >
                Làm tiếp
              </Button>
              <Button
                onClick={handleSubmitTest}
                className="rounded-xl bg-purple-600 text-xs font-bold text-white hover:bg-purple-700"
              >
                Nộp bài ngay
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Xác nhận thoát bài thi */}
        <AlertDialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận thoát bài thi</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn thoát khỏi bài thi hiện tại? Tiến trình và kết
                quả làm bài sẽ bị huỷ.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setExitConfirmOpen(false)}>
                Tiếp tục làm bài
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  setExitConfirmOpen(false)
                  setTestPhase("config")
                }}
              >
                Thoát bài thi
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // ==========================================
  // GIAI ĐOẠN 3: KẾT QUẢ BÀI KIỂM TRA (RESULT)
  // ==========================================
  const formatResultTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    if (m === 0) return `${s} giây`
    return `${m} phút ${s} giây`
  }

  const getRank = () => {
    if (score === 100)
      return {
        title: "Tuyệt đỉnh! 🌟",
        desc: "Bạn đã trả lời chính xác 100% câu hỏi!",
        badge: "bg-amber-500/20 text-amber-500",
      }
    if (score >= 80)
      return {
        title: "Xuất sắc! 🎉",
        desc: "Kiến thức của bạn rất vững vàng!",
        badge: "bg-emerald-500/20 text-emerald-500",
      }
    if (score >= 50)
      return {
        title: "Đạt yêu cầu! 👍",
        desc: "Hãy ôn lại các câu đã làm sai để tiến bộ hơn nhé.",
        badge: "bg-blue-500/20 text-blue-500",
      }
    return {
      title: "Cần cố gắng thêm! 💪",
      desc: "Đừng nản lòng, hãy luyện tập thêm để ghi nhớ tốt hơn!",
      badge: "bg-rose-500/20 text-rose-500",
    }
  }

  const rank = getRank()

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      {/* Result Hero Card */}
      <div className="border-border bg-card overflow-hidden rounded-3xl border p-6 text-center shadow-xl sm:p-8">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-lg">
          <Award className="size-8" />
        </div>

        <span
          className={cn(
            "inline-block rounded-full px-3 py-1 text-xs font-bold",
            rank.badge
          )}
        >
          {rank.title}
        </span>

        <h1 className="text-foreground mt-2 text-3xl font-black sm:text-4xl">
          Kết quả bài kiểm tra
        </h1>
        <p className="text-muted-foreground mt-1 text-xs font-medium">
          {rank.desc}
        </p>

        {/* Big Metric Box */}
        <div className="border-border/60 from-muted/30 to-background my-6 rounded-2xl border bg-gradient-to-b p-6">
          <div className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
            Điểm số đạt được
          </div>
          <div className="text-foreground mt-1 text-5xl font-black sm:text-6xl">
            {score}
            <span className="text-3xl text-purple-600 sm:text-4xl">%</span>
          </div>

          <div className="border-border/60 mt-6 grid grid-cols-3 gap-2 border-t pt-4">
            <div className="text-center">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Số câu đúng</span>
              </div>
              <div className="mt-0.5 text-lg font-bold text-emerald-500">
                {correctCount} / {questions.length}
              </div>
            </div>

            <div className="text-center">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <XCircle className="size-3.5 text-rose-500" />
                <span>Số câu sai</span>
              </div>
              <div className="mt-0.5 text-lg font-bold text-rose-500">
                {incorrectCount}
              </div>
            </div>

            <div className="text-center">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <Clock className="size-3.5 text-blue-500" />
                <span>Thời gian làm</span>
              </div>
              <div className="text-foreground mt-0.5 text-lg font-bold">
                {formatResultTime(totalDuration)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => setTestPhase("config")}
            className="gap-2 rounded-xl bg-purple-600 font-bold text-white shadow-xs hover:bg-purple-700"
          >
            <RotateCcw className="size-4" />
            <span>Làm lại bài kiểm tra</span>
          </Button>

          <Link
            href={`/sets/${setId}`}
            className="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
          >
            <BookOpen className="size-4" />
            <span>Về bộ thẻ</span>
          </Link>
        </div>
      </div>

      {/* Chi tiết từng câu hỏi đúng/sai */}
      <div className="space-y-4">
        <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
          <Sparkles className="size-4 text-purple-600" />
          <span>Chi tiết từng câu hỏi ({questions.length})</span>
        </h2>

        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className={cn(
                "border-border bg-card rounded-2xl border p-4 shadow-2xs transition-all",
                q.isCorrect ? "border-emerald-500/40" : "border-rose-500/40"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white",
                      q.isCorrect ? "bg-emerald-500" : "bg-rose-500"
                    )}
                  >
                    {q.isCorrect ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs font-bold">
                        Câu {idx + 1}
                      </span>
                      <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">
                        {q.kind}
                      </span>
                    </div>

                    <div className="font-japanese text-foreground text-base font-bold">
                      {q.prompt} {q.subPrompt && `(${q.subPrompt})`}
                    </div>

                    <div className="text-xs">
                      <span className="text-muted-foreground">
                        Bạn đã chọn:{" "}
                      </span>
                      <span
                        className={cn(
                          "font-bold",
                          q.isCorrect ? "text-emerald-600" : "text-rose-600"
                        )}
                      >
                        {q.userAnswer || "(Bỏ trống)"}
                      </span>
                    </div>

                    {!q.isCorrect && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">
                          Đáp án đúng:{" "}
                        </span>
                        <span className="text-foreground font-bold">
                          {q.correctAnswer}
                        </span>
                      </div>
                    )}

                    {q.card.example && (
                      <div className="bg-muted/40 font-japanese text-muted-foreground mt-2 rounded-lg p-2 text-xs italic">
                        Ví dụ: {q.card.example}
                        {q.card.exampleTranslation &&
                          ` (${q.card.exampleTranslation})`}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => speak(q.card.term)}
                  className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-md p-1.5 transition-colors"
                  title="Phát âm tiếng Nhật"
                >
                  <Volume2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
