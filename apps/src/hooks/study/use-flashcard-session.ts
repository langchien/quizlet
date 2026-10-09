"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTTS } from "@/hooks/useTTS"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useAuthStore } from "@/stores/useAuthStore"
import { toast } from "sonner"
import {
  startStudySessionAction,
  answerCardAction,
  endStudySessionAction,
} from "@/actions/study"
import type { FlashcardItem } from "@/types/flashcard"

interface UseFlashcardSessionProps {
  setId: string
}

export function useFlashcardSession({ setId }: UseFlashcardSessionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isReverseParam = searchParams.get("reverse") === "true"
  const statusParam = searchParams.get("status") || "All"
  const tagParam = searchParams.get("tag")

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

  const [cards, setCards] = React.useState<FlashcardItem[]>([])
  const [setName, setSetName] = React.useState("")
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [cheatsheetOpen, setCheatsheetOpen] = React.useState(false)

  // Study state
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isFlipped, setIsFlipped] = React.useState(false)
  const [isReverse, setIsReverse] = React.useState(false)
  const [isShuffle, setIsShuffle] = React.useState(false)
  const [isAutoPlay, setIsAutoPlay] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // Session results
  const [correctCards, setCorrectCards] = React.useState<FlashcardItem[]>([])
  const [incorrectCards, setIncorrectCards] = React.useState<FlashcardItem[]>(
    []
  )
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
        const res = await startStudySessionAction({
          studySetId: setId,
          mode: "Flashcard",
          shuffle: shuffleMode,
          reverse: isReverseParam,
          filterByStatus:
            (statusParam as
              "New" | "Learning" | "Review" | "Mastered" | "All") || "All",
          filterByTags: tagParam ? [tagParam] : [],
        })

        if (res.success && res.data) {
          setCards(res.data.cards as unknown as FlashcardItem[])
          setSessionId(res.data.session.id)
          if (res.data.cards.length > 0 && res.data.cards[0].studySet?.name) {
            setSetName(res.data.cards[0].studySet.name)
          }
        } else {
          toast.error(res.error || "Không thể tải danh sách thẻ học.")
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
    [setId, router, isReverseParam, statusParam, tagParam]
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
        await answerCardAction({
          sessionId: sessionId || undefined,
          cardId: currentCard.id,
          isCorrect,
          timeTaken,
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
          await endStudySessionAction({
            sessionId: sessionId || undefined,
            studySetId: setId,
            mode: "Flashcard",
            duration: totalSecs,
            totalCards: cards.length,
            correctCards: finalCorrect,
            incorrectCards: finalIncorrect,
            score,
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
    if (typeof document !== "undefined") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
        setIsFullscreen(true)
      } else {
        document.exitFullscreen().catch(() => {})
        setIsFullscreen(false)
      }
    }
  }

  return {
    cards,
    setName,
    sessionId,
    loading,
    currentIndex,
    currentCard,
    isFlipped,
    setIsFlipped,
    isReverse,
    setIsReverse,
    isShuffle,
    setIsShuffle,
    isAutoPlay,
    setIsAutoPlay,
    isFullscreen,
    toggleFullscreen,
    cheatsheetOpen,
    setCheatsheetOpen,
    correctCards,
    incorrectCards,
    isCompleted,
    totalDuration,
    handleFlip,
    handleSpeak,
    handleAnswer,
    handlePrev,
    handleNext,
    handleRestart: () => initSession(isShuffle),
    handleReviewMistakes,
  }
}
