"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useTTS } from "@/hooks/useTTS"
import { isStudyAnswerCorrect } from "@/lib/study-matcher"
import {
  startStudySessionAction,
  answerCardAction,
  endStudySessionAction,
} from "@/actions/study"
import type { WriteCardItem, WriteStatus } from "@/types/write"

interface UseWriteSessionProps {
  setId: string
}

export function useWriteSession({ setId }: UseWriteSessionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isReverseParam = searchParams.get("reverse") === "true"
  const isShuffleParam = searchParams.get("shuffle") !== "false"
  const statusParam = searchParams.get("status") || "All"
  const tagParam = searchParams.get("tag")

  const { speak } = useTTS()

  const [cards, setCards] = React.useState<WriteCardItem[]>([])
  const [setName, setSetName] = React.useState("")
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Current Card & Typing State
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [userTyped, setUserTyped] = React.useState("")
  const [failedAttempts, setFailedAttempts] = React.useState(0)
  const [status, setStatus] = React.useState<WriteStatus>("typing")

  // Results
  const [correctCards, setCorrectCards] = React.useState<WriteCardItem[]>([])
  const [incorrectCards, setIncorrectCards] = React.useState<WriteCardItem[]>(
    []
  )
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [totalDuration, setTotalDuration] = React.useState(0)

  const startTimeRef = React.useRef<number>(0)
  const cardStartTimeRef = React.useRef<number>(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

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
        const cardsData = res.data.cards as unknown as WriteCardItem[]
        setCards(cardsData)
        setSessionId(res.data.session.id)
        if (cardsData.length > 0 && cardsData[0].studySet?.name) {
          setSetName(cardsData[0].studySet.name)
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

  // Focus ô nhập khi ở trạng thái gõ bài
  React.useEffect(() => {
    if (status === "typing") {
      inputRef.current?.focus()
    }
  }, [currentIndex, status])

  const currentCard = cards[currentIndex]

  // Kiểm tra đáp án
  const handleCheckAnswer = React.useCallback(async () => {
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
  }, [currentCard, status, userTyped, speak, sessionId, failedAttempts])

  // Override: "Đáp án của tôi đúng"
  const handleOverrideCorrect = React.useCallback(async () => {
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
  }, [currentCard, sessionId, userTyped])

  // Sang thẻ tiếp theo
  const handleNextCard = React.useCallback(() => {
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
  }, [
    currentIndex,
    cards.length,
    correctCards.length,
    incorrectCards.length,
    sessionId,
    setId,
  ])

  return {
    cards,
    setName,
    sessionId,
    loading,
    currentIndex,
    currentCard,
    userTyped,
    setUserTyped,
    failedAttempts,
    status,
    correctCards,
    incorrectCards,
    isCompleted,
    totalDuration,
    inputRef,
    speak,
    initSession,
    handleCheckAnswer,
    handleOverrideCorrect,
    handleNextCard,
  }
}
