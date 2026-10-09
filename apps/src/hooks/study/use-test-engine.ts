"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { isStudyAnswerCorrect } from "@/lib/study-matcher"
import { startStudySessionAction, endStudySessionAction } from "@/actions/study"

export interface CardItem {
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

export type QuestionKind = "multiple-choice" | "true-false" | "written"

export interface TestQuestion {
  id: string
  card: CardItem
  kind: QuestionKind
  prompt: string
  subPrompt?: string
  correctAnswer: string
  options?: string[]
  tfPair?: { isTrue: boolean; displayedAnswer: string }
  userAnswer?: string
  isCorrect?: boolean
}

export type TestPhase = "config" | "testing" | "result"

export function useTestEngine(setId: string) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusParam = searchParams.get("status") || "All"
  const tagParam = searchParams.get("tag")

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
  const [timeLimitMinutes, setTimeLimitMinutes] = React.useState<number>(0)
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
      const res = await startStudySessionAction({
        studySetId: setId,
        mode: "Test",
        shuffle: true,
        reverse: false,
        filterByStatus:
          (statusParam as "New" | "Learning" | "Review" | "Mastered" | "All") ||
          "All",
        filterByTags: tagParam ? [tagParam] : [],
      })
      if (res.success && res.data) {
        const cards = (res.data.cards || []) as unknown as CardItem[]
        setAllCards(cards)
        setSessionId(res.data.session.id)
        if (cards.length > 0 && cards[0].studySet?.name) {
          setSetName(cards[0].studySet.name)
        }
        if (cards.length > 0) {
          setQuestionCount(Math.min(20, cards.length))
        }

        const storedPB = localStorage.getItem(`nihomemo_test_pb_${setId}`)
        if (storedPB) {
          setPersonalBestScore(Number(storedPB))
        }
      } else {
        toast.error(res.error || "Không tìm thấy bộ thẻ.")
        router.push("/library")
      }
    } catch (err) {
      console.error("Lỗi tải bộ thẻ:", err)
      toast.error("Lỗi kết nối máy chủ.")
    } finally {
      setLoading(false)
    }
  }, [setId, router, statusParam, tagParam])

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
      const shuffledCards = [...cards].sort(() => 0.5 - Math.random())
      const selectedCards = shuffledCards.slice(0, count)

      return selectedCards.map((card, idx) => {
        const kind = types[Math.floor(Math.random() * types.length)]

        // KHÓA CHIỀU VIẾT: Luôn luôn hiển thị nghĩa tiếng Việt -> Yêu cầu gõ từ tiếng Nhật
        if (kind === "written") {
          return {
            id: `q_${idx}_${card.id}`,
            card,
            kind: "written",
            prompt: card.definition,
            subPrompt: undefined,
            correctAnswer: card.term,
          }
        }

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
            prompt: card.definition,
            subPrompt: undefined,
            correctAnswer: card.term,
          }
        }
      })
    },
    []
  )

  // Bắt đầu làm bài kiểm tra
  const handleStartTest = () => {
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

    setTestPhase("testing")
  }

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
        isCorrect = isStudyAnswerCorrect({
          userAnswer: q.userAnswer,
          card: q.card,
          isReverse: false,
        })
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

    const currentPB = personalBestScore ?? 0
    if (finalScore > currentPB) {
      setPersonalBestScore(finalScore)
      localStorage.setItem(`nihomemo_test_pb_${setId}`, String(finalScore))
    }

    endStudySessionAction({
      sessionId: sessionId || undefined,
      studySetId: setId,
      mode: "Test",
      duration,
      totalCards: questions.length,
      correctCards: correct,
      incorrectCards: incorrect,
      score: finalScore,
    }).catch((err) => console.error("Lỗi gửi kết quả bài test:", err))

    setConfirmSubmitOpen(false)
    setTestPhase("result")
  }, [questions, personalBestScore, sessionId, setId])

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

  // Cập nhật đáp án người dùng
  const handleAnswerQuestion = (qIndex: number, ans: string) => {
    setQuestions((prev) => {
      const updated = [...prev]
      updated[qIndex] = { ...updated[qIndex], userAnswer: ans }
      return updated
    })
  }

  const answeredCount = questions.filter(
    (q) => q.userAnswer !== undefined && q.userAnswer.trim() !== ""
  ).length

  const handleRestartTest = () => {
    setTestPhase("config")
  }

  return {
    loading,
    allCards,
    setName,
    testPhase,
    setTestPhase,
    // Config state & setters
    questionCount,
    setQuestionCount,
    allowMultipleChoice,
    setAllowMultipleChoice,
    allowTrueFalse,
    setAllowTrueFalse,
    allowWritten,
    setAllowWritten,
    timeLimitMinutes,
    setTimeLimitMinutes,
    isReverse,
    setIsReverse,
    personalBestScore,
    // Testing state & actions
    questions,
    activeQuestionIndex,
    setActiveQuestionIndex,
    timeLeftSeconds,
    answeredCount,
    confirmSubmitOpen,
    setConfirmSubmitOpen,
    exitConfirmOpen,
    setExitConfirmOpen,
    handleAnswerQuestion,
    handleStartTest,
    handleSubmitTest,
    handleRestartTest,
    // Results
    score,
    correctCount,
    incorrectCount,
    totalDuration,
  }
}
