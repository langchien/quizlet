"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTTS } from "@/hooks/useTTS"
import { toast } from "sonner"
import { isStudyAnswerCorrect } from "@/lib/study-matcher"
import {
  startStudySessionAction,
  answerCardAction,
  endStudySessionAction,
} from "@/actions/study"
import type {
  LearnCardItem,
  LearnQuestionType,
  LearnQuestionData,
} from "@/types/learn"

interface UseLearnSessionProps {
  setId: string
}

export function useLearnSession({ setId }: UseLearnSessionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isReverse = searchParams.get("reverse") === "true"
  const isShuffleParam = searchParams.get("shuffle") !== "false"
  const statusParam = searchParams.get("status") || "All"
  const tagParam = searchParams.get("tag")

  const { speak } = useTTS()

  const [allCards, setAllCards] = React.useState<LearnCardItem[]>([])
  const [queue, setQueue] = React.useState<LearnCardItem[]>([])
  const [setName, setSetName] = React.useState("")
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Current Question State
  const [currentQuestion, setCurrentQuestion] =
    React.useState<LearnQuestionData | null>(null)
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

  // Tạo câu hỏi ngẫu nhiên từ thẻ hiện tại
  const generateQuestion = React.useCallback(
    (
      card: LearnCardItem,
      cardList: LearnCardItem[],
      reverse: boolean
    ): LearnQuestionData => {
      const types: LearnQuestionType[] = [
        "multiple-choice",
        "true-false",
        "written",
      ]
      const randomType =
        cardList.length < 4
          ? "written"
          : types[Math.floor(Math.random() * types.length)]

      // KHÓA CHIỀU VIẾT: Luôn hiển thị nghĩa tiếng Việt -> Gõ từ tiếng Nhật
      if (randomType === "written") {
        return {
          card,
          type: "written",
          prompt: card.definition,
          subPrompt: undefined,
          correctAnswer: card.term,
        }
      }

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
      const res = await startStudySessionAction({
        studySetId: setId,
        mode: "Learn",
        shuffle: isShuffleParam,
        reverse: isReverse,
        filterByStatus:
          (statusParam as "New" | "Learning" | "Review" | "Mastered" | "All") ||
          "All",
        filterByTags: tagParam ? [tagParam] : [],
      })

      if (res.success && res.data) {
        const cardsData: LearnCardItem[] = (res.data.cards ||
          []) as unknown as LearnCardItem[]
        setAllCards(cardsData)
        setQueue([...cardsData])
        setSessionId(res.data.session.id)

        if (cardsData.length > 0) {
          if (cardsData[0].studySet?.name) {
            setSetName(cardsData[0].studySet.name)
          }
          const firstQ = generateQuestion(cardsData[0], cardsData, isReverse)
          setCurrentQuestion(firstQ)
        }
      } else {
        toast.error(res.error || "Không thể tải danh sách câu hỏi.")
        router.push(`/sets/${setId}`)
      }
    } catch (err) {
      console.error("Error loading learn session:", err)
      toast.error("Lỗi kết nối máy chủ.")
    } finally {
      setLoading(false)
      cardStartTimeRef.current = Date.now()
    }
  }, [
    setId,
    router,
    isReverse,
    generateQuestion,
    isShuffleParam,
    statusParam,
    tagParam,
  ])

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
        await answerCardAction({
          sessionId: sessionId || undefined,
          cardId: card.id,
          isCorrect: isCorrectAnswer,
          userAnswer,
          timeTaken,
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

    const isMatch = isStudyAnswerCorrect({
      userAnswer: writtenAnswer,
      card: currentQuestion.card,
      isReverse: false, // Luôn so khớp tiếng Nhật (hỗ trợ Kanji & Hiragana)
    })

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

      endStudySessionAction({
        sessionId: sessionId || undefined,
        studySetId: setId,
        mode: "Learn",
        duration: totalSecs,
        totalCards: total,
        correctCards: correctCount,
        incorrectCards: incorrectCount,
        score,
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

  return {
    allCards,
    queue,
    setName,
    sessionId,
    loading,
    currentQuestion,
    selectedOption,
    writtenAnswer,
    setWrittenAnswer,
    showFeedback,
    isCurrentCorrect,
    writtenFailedAttempts,
    correctCardIds,
    incorrectCardIds,
    isCompleted,
    totalDuration,
    isReverse,
    speak,
    initSession,
    handleSelectAnswer,
    handleCheckWritten,
    handleNextQuestion,
  }
}
