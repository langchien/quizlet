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
import type { ListenCardItem, ListenStatus } from "@/types/listen"

interface UseListenSessionProps {
  setId: string
}

export function useListenSession({ setId }: UseListenSessionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isReverseParam = searchParams.get("reverse") === "true"
  const isShuffleParam = searchParams.get("shuffle") !== "false"
  const statusParam = searchParams.get("status") || "All"
  const tagParam = searchParams.get("tag")

  const { speak, isPlaying } = useTTS()

  const [cards, setCards] = React.useState<ListenCardItem[]>([])
  const [setName, setSetName] = React.useState("")
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Current Card & Answer State
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [userTyped, setUserTyped] = React.useState("")
  const [failedAttempts, setFailedAttempts] = React.useState(0)
  const [status, setStatus] = React.useState<ListenStatus>("listening")
  const [playbackRate, setPlaybackRate] = React.useState<number>(1.0)

  // Results
  const [correctCards, setCorrectCards] = React.useState<ListenCardItem[]>([])
  const [incorrectCards, setIncorrectCards] = React.useState<ListenCardItem[]>(
    []
  )
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
      const res = await startStudySessionAction({
        studySetId: setId,
        mode: "Listen",
        shuffle: isShuffleParam,
        reverse: isReverseParam,
        filterByStatus:
          (statusParam as "New" | "Learning" | "Review" | "Mastered" | "All") ||
          "All",
        filterByTags: tagParam ? [tagParam] : [],
      })

      if (res.success && res.data) {
        const cardsData = (res.data.cards || []) as unknown as ListenCardItem[]
        setCards(cardsData)
        setSessionId(res.data.session.id)
        if (cardsData.length > 0 && cardsData[0].studySet?.name) {
          setSetName(cardsData[0].studySet.name)
        }
      } else {
        toast.error(res.error || "Không thể tải danh sách thẻ nghe.")
        router.push(`/sets/${setId}`)
      }
    } catch (err) {
      console.error("Lỗi khởi tạo session Listen:", err)
      toast.error("Lỗi kết nối máy chủ.")
    } finally {
      setLoading(false)
      cardStartTimeRef.current = Date.now()
    }
  }, [setId, router, isReverseParam, isShuffleParam, statusParam, tagParam])

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
  const handleCheckAnswer = React.useCallback(async () => {
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
        await answerCardAction({
          sessionId: sessionId || undefined,
          cardId: currentCard.id,
          isCorrect: true,
          userAnswer: userTyped,
          timeTaken,
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
          await answerCardAction({
            sessionId: sessionId || undefined,
            cardId: currentCard.id,
            isCorrect: false,
            userAnswer: userTyped,
            timeTaken,
          })
        } catch (err) {
          console.error("Lỗi ghi nhận câu trả lời sai:", err)
        }
      } else {
        toast.error(`Chưa chính xác! Còn ${3 - newAttempts} lần thử.`)
      }
    }
  }, [
    currentCard,
    status,
    userTyped,
    handlePlayAudio,
    sessionId,
    failedAttempts,
  ])

  // Bỏ qua / Tiết lộ đáp án
  const handleGiveUp = React.useCallback(async () => {
    if (!currentCard || status !== "listening") return

    setStatus("revealed")
    setIncorrectCards((prev) => [...prev, currentCard])
    handlePlayAudio()

    try {
      await answerCardAction({
        sessionId: sessionId || undefined,
        cardId: currentCard.id,
        isCorrect: false,
        userAnswer: userTyped || "(Bỏ qua)",
        timeTaken: 1,
      })
    } catch (err) {
      console.error("Lỗi khi bỏ qua câu hỏi:", err)
    }
  }, [currentCard, status, userTyped, handlePlayAudio, sessionId])

  // Chuyển sang câu tiếp theo
  const handleNextCard = React.useCallback(() => {
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

      endStudySessionAction({
        sessionId: sessionId || undefined,
        studySetId: setId,
        mode: "Listen",
        duration: totalSecs,
        totalCards: cards.length,
        correctCards: correctCount,
        incorrectCards: incorrectCount,
        score,
      }).catch((err) => console.error("Lỗi kết thúc session Listen:", err))

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

  // Phím tắt bàn phím Space để nghe lại audio
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
    playbackRate,
    setPlaybackRate,
    correctCards,
    incorrectCards,
    isCompleted,
    totalDuration,
    inputRef,
    isPlaying,
    initSession,
    handlePlayAudio,
    handleCheckAnswer,
    handleGiveUp,
    handleNextCard,
  }
}
