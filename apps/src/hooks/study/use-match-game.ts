"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useTTS } from "@/hooks/useTTS"
import { startStudySessionAction, endStudySessionAction } from "@/actions/study"
import type { MatchCardItem, MatchTile } from "@/types/match"

interface UseMatchGameProps {
  setId: string
}

export function useMatchGame({ setId }: UseMatchGameProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const statusParam = searchParams.get("status") || "All"
  const tagParam = searchParams.get("tag")

  const { speak } = useTTS()

  const [allCards, setAllCards] = React.useState<MatchCardItem[]>([])
  const [setName, setSetName] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [sessionId, setSessionId] = React.useState<string | null>(null)

  // Game state
  const [tiles, setTiles] = React.useState<MatchTile[]>([])
  const [selectedTileId, setSelectedTileId] = React.useState<string | null>(
    null
  )
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [elapsedTimeMs, setElapsedTimeMs] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [penaltyCount, setPenaltyCount] = React.useState(0)
  const [matchedPairsCount, setMatchedPairsCount] = React.useState(0)
  const [totalPairs, setTotalPairs] = React.useState(0)
  const [personalBestSecs, setPersonalBestSecs] = React.useState<number | null>(
    null
  )
  const [isNewRecord, setIsNewRecord] = React.useState(false)

  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = React.useRef<number>(0)
  const penaltyRef = React.useRef<number>(0)

  // Tải dữ liệu bộ thẻ
  const loadCards = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await startStudySessionAction({
        studySetId: setId,
        mode: "Match",
        shuffle: true,
        reverse: false,
        filterByStatus:
          (statusParam as "New" | "Learning" | "Review" | "Mastered" | "All") ||
          "All",
        filterByTags: tagParam ? [tagParam] : [],
      })
      if (res.success && res.data) {
        const cards: MatchCardItem[] = res.data
          .cards as unknown as MatchCardItem[]
        setAllCards(cards)
        setSessionId(res.data.session.id)
        if (cards.length > 0 && cards[0].studySet?.name) {
          setSetName(cards[0].studySet.name)
        }

        // Đọc Personal Best từ localStorage
        const storedPB = localStorage.getItem(`nihomemo_match_pb_${setId}`)
        if (storedPB) {
          setPersonalBestSecs(parseFloat(storedPB))
        }
      } else {
        toast.error(res.error || "Không tìm thấy bộ thẻ.")
        router.push("/library")
      }
    } catch (err) {
      console.error("Lỗi tải bộ thẻ match mode:", err)
      toast.error("Lỗi kết nối máy chủ.")
    } finally {
      setLoading(false)
    }
  }, [setId, router, statusParam, tagParam])

  React.useEffect(() => {
    loadCards()
  }, [loadCards])

  // Khởi động màn chơi ghép đôi mới
  const startNewGame = React.useCallback(
    (cardList: MatchCardItem[] = allCards) => {
      if (cardList.length < 2) {
        toast.error("Cần ít nhất 2 thẻ từ vựng để chơi ghép đôi.")
        return
      }

      // Chọn tối đa 6 cặp thẻ để giao diện vừa vặn và mượt mà nhất
      const shuffled = [...cardList].sort(() => 0.5 - Math.random())
      const gameCards = shuffled.slice(0, Math.min(6, shuffled.length))
      setTotalPairs(gameCards.length)
      setMatchedPairsCount(0)
      setSelectedTileId(null)
      setIsCompleted(false)
      setIsNewRecord(false)
      setPenaltyCount(0)
      penaltyRef.current = 0

      // Tạo các ô tile (1 ô tiếng Nhật, 1 ô tiếng Việt)
      const newTiles: MatchTile[] = []
      gameCards.forEach((c) => {
        newTiles.push({
          tileId: `term_${c.id}`,
          cardId: c.id,
          type: "term",
          text: c.term,
          subText: c.reading,
          isMatched: false,
          isWrong: false,
        })
        newTiles.push({
          tileId: `def_${c.id}`,
          cardId: c.id,
          type: "definition",
          text: c.definition,
          isMatched: false,
          isWrong: false,
        })
      })

      // Xáo trộn vị trí của toàn bộ tiles
      const randomizedTiles = newTiles.sort(() => 0.5 - Math.random())
      setTiles(randomizedTiles)

      // Khởi động đồng hồ bấm giờ
      startTimeRef.current = Date.now()
      setElapsedTimeMs(0)
      setIsPlaying(true)
    },
    [allCards]
  )

  // Tự động khởi chạy ván đầu tiên khi thẻ đã được nạp
  React.useEffect(() => {
    if (
      allCards.length > 0 &&
      !isPlaying &&
      !isCompleted &&
      tiles.length === 0
    ) {
      startNewGame(allCards)
    }
  }, [allCards, isPlaying, isCompleted, tiles.length, startNewGame])

  // Stopwatch timer loop
  React.useEffect(() => {
    if (!isPlaying) return

    timerRef.current = setInterval(() => {
      const current = Date.now()
      const elapsed = current - startTimeRef.current + penaltyRef.current * 1000
      setElapsedTimeMs(elapsed)
    }, 100)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying])

  // Kết thúc trò chơi khi ghép hết tất cả các ô
  const handleGameWin = React.useCallback(async () => {
    setIsPlaying(false)
    if (timerRef.current) clearInterval(timerRef.current)

    const finalTimeMs =
      Date.now() - startTimeRef.current + penaltyRef.current * 1000
    const finalSecs = parseFloat((finalTimeMs / 1000).toFixed(1))
    setElapsedTimeMs(finalTimeMs)

    // So sánh với Personal Best
    const currentPB = personalBestSecs
    if (currentPB === null || finalSecs < currentPB) {
      setIsNewRecord(true)
      setPersonalBestSecs(finalSecs)
      localStorage.setItem(`nihomemo_match_pb_${setId}`, String(finalSecs))
    }

    setIsCompleted(true)

    // Gửi session về server
    endStudySessionAction({
      sessionId: sessionId || undefined,
      studySetId: setId,
      mode: "Match",
      duration: Math.round(finalSecs),
      totalCards: totalPairs,
      correctCards: totalPairs,
      incorrectCards: penaltyRef.current,
      score: 100,
    }).catch((err) => console.error("Lỗi gửi kết quả session Match:", err))
  }, [personalBestSecs, sessionId, setId, totalPairs])

  // Xử lý khi click vào 1 ô tile
  const handleTileClick = React.useCallback(
    (clickedTile: MatchTile) => {
      if (clickedTile.isMatched || clickedTile.isWrong || !isPlaying) return

      // Nếu chưa có ô nào được chọn
      if (!selectedTileId) {
        setSelectedTileId(clickedTile.tileId)
        if (clickedTile.type === "term") {
          speak(clickedTile.text)
        }
        return
      }

      // Nếu click lại chính ô đó -> Huỷ chọn
      if (selectedTileId === clickedTile.tileId) {
        setSelectedTileId(null)
        return
      }

      const prevTile = tiles.find((t) => t.tileId === selectedTileId)
      if (!prevTile) {
        setSelectedTileId(null)
        return
      }

      // 1. TRƯỜNG HỢP GHÉP ĐÚNG (Cùng cardId và khác loại tile)
      if (
        prevTile.cardId === clickedTile.cardId &&
        prevTile.type !== clickedTile.type
      ) {
        // Tìm từ vựng để phát âm
        const matchedCard = allCards.find((c) => c.id === clickedTile.cardId)
        if (matchedCard) {
          speak(matchedCard.term)
        }

        // Đánh dấu cả 2 ô là đã ghép thành công
        setTiles((prev) =>
          prev.map((t) =>
            t.tileId === prevTile.tileId || t.tileId === clickedTile.tileId
              ? { ...t, isMatched: true }
              : t
          )
        )
        setSelectedTileId(null)

        const nextMatchedCount = matchedPairsCount + 1
        setMatchedPairsCount(nextMatchedCount)

        // Kiểm tra nếu đã hoàn thành tất cả các cặp
        if (nextMatchedCount >= totalPairs) {
          handleGameWin()
        }
      } else {
        // 2. TRƯỜNG HỢP GHÉP SAI
        penaltyRef.current += 1 // Phạt cộng 1 giây
        setPenaltyCount((prev) => prev + 1)
        toast.error("Chưa chính xác! (+1 giây)")

        // Hiệu ứng rung lắc (shake) ô sai
        setTiles((prev) =>
          prev.map((t) =>
            t.tileId === prevTile.tileId || t.tileId === clickedTile.tileId
              ? { ...t, isWrong: true }
              : t
          )
        )
        setSelectedTileId(null)

        // Xoá trạng thái wrong sau 400ms
        setTimeout(() => {
          setTiles((prev) =>
            prev.map((t) =>
              t.tileId === prevTile.tileId || t.tileId === clickedTile.tileId
                ? { ...t, isWrong: false }
                : t
            )
          )
        }, 400)
      }
    },
    [
      isPlaying,
      selectedTileId,
      tiles,
      allCards,
      matchedPairsCount,
      totalPairs,
      speak,
      handleGameWin,
    ]
  )

  const secondsFormatted = (elapsedTimeMs / 1000).toFixed(1)

  return {
    allCards,
    setName,
    loading,
    tiles,
    selectedTileId,
    isCompleted,
    isPlaying,
    elapsedTimeMs,
    secondsFormatted,
    penaltyCount,
    matchedPairsCount,
    totalPairs,
    personalBestSecs,
    isNewRecord,
    startNewGame,
    handleTileClick,
  }
}
