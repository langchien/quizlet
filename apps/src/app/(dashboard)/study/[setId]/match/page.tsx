"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Sparkles,
  Timer,
  Trophy,
  RotateCcw,
  BookOpen,
  ChevronLeft,
  Flame,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  jlptLevel?: string | null
  wordType?: string | null
  studySet?: { id: string; name: string } | null
}

interface MatchTile {
  tileId: string
  cardId: string
  type: "term" | "definition"
  text: string
  subText?: string
  isMatched: boolean
  isWrong: boolean
}

export default function MatchStudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = (params.setId || params.id) as string

  const { speak } = useTTS()

  const [allCards, setAllCards] = React.useState<CardItem[]>([])
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
      const res = await fetch(`/api/sets/${setId}`)
      if (res.ok) {
        const data = await res.json()
        const cards: CardItem[] = data.cards || []
        setAllCards(cards)
        setSetName(data.name || "")

        // Đọc Personal Best từ localStorage
        const storedPB = localStorage.getItem(`nihomemo_match_pb_${setId}`)
        if (storedPB) {
          setPersonalBestSecs(parseFloat(storedPB))
        }
      } else {
        toast.error("Không tìm thấy bộ thẻ.")
        router.push("/library")
      }
    } catch (err) {
      console.error("Lỗi tải bộ thẻ match mode:", err)
      toast.error("Lỗi kết nối máy chủ.")
    } finally {
      setLoading(false)
    }
  }, [setId, router])

  React.useEffect(() => {
    loadCards()
  }, [loadCards])

  // Khởi động màn chơi ghép đôi
  const startNewGame = React.useCallback(
    async (cardList: CardItem[]) => {
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

      // Bắt đầu session trên server
      try {
        const res = await fetch("/api/study/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studySetId: setId,
            mode: "Match",
            shuffle: true,
            limit: gameCards.length,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setSessionId(data.session?.id || null)
        }
      } catch (err) {
        console.error("Lỗi khởi tạo session Match:", err)
      }
    },
    [setId]
  )

  React.useEffect(() => {
    if (allCards.length > 0 && !isPlaying && !isCompleted) {
      startNewGame(allCards)
    }
  }, [allCards, isPlaying, isCompleted, startNewGame])

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
    try {
      await fetch("/api/study/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          studySetId: setId,
          mode: "Match",
          duration: Math.round(finalSecs),
          totalCards: totalPairs,
          correctCards: totalPairs,
          incorrectCards: penaltyRef.current,
          score: 100,
        }),
      })
    } catch (err) {
      console.error("Lỗi gửi kết quả session Match:", err)
    }
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

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium">
          Đang khởi tạo trò chơi Ghép đôi (Match)...
        </p>
      </div>
    )
  }

  if (allCards.length < 2) {
    return (
      <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-8 text-center shadow-md">
        <Sparkles className="text-muted-foreground mx-auto mb-3 size-12" />
        <h3 className="text-foreground text-lg font-bold">
          Chưa đủ thẻ để chơi
        </h3>
        <p className="text-muted-foreground mt-1 mb-6 text-xs">
          Trò chơi Ghép đôi yêu cầu bộ thẻ phải có ít nhất 2 thẻ từ vựng.
        </p>
        <Button onClick={() => router.push(`/sets/${setId}`)}>
          Quay về bộ thẻ
        </Button>
      </div>
    )
  }

  const secondsFormatted = (elapsedTimeMs / 1000).toFixed(1)

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* Top Controls Header */}
      <div className="border-border bg-card/80 flex items-center justify-between rounded-2xl border p-3.5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Link
            href={`/sets/${setId}`}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            <ChevronLeft className="size-4" />
            <span>Về bộ thẻ</span>
          </Link>
          {setName && (
            <Badge
              variant="outline"
              className="hidden text-[10px] sm:inline-flex"
            >
              {setName}
            </Badge>
          )}
        </div>

        {/* Stopwatch & Pairs Progress */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3.5 py-1 text-xs font-black text-rose-600 dark:text-rose-400">
            <Timer className="size-4" />
            <span className="font-mono text-sm">{secondsFormatted}s</span>
          </div>

          <div className="text-muted-foreground hidden text-xs font-bold sm:inline-block">
            Còn lại:{" "}
            <span className="text-foreground font-black">
              {totalPairs - matchedPairsCount}
            </span>{" "}
            / {totalPairs} cặp
          </div>
        </div>

        {/* Quick Restart Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => startNewGame(allCards)}
          className="gap-1.5 rounded-xl text-xs font-bold"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Chơi lại</span>
        </Button>
      </div>

      {/* MATCH GRID CONTAINER */}
      {!isCompleted ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map((tile) => {
            const isSelected = selectedTileId === tile.tileId

            return (
              <button
                key={tile.tileId}
                type="button"
                disabled={tile.isMatched}
                onClick={() => handleTileClick(tile)}
                className={cn(
                  "relative flex min-h-[110px] flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-200 select-none sm:min-h-[130px]",
                  // Trạng thái đã ghép xong: biến mất
                  tile.isMatched
                    ? "pointer-events-none scale-90 opacity-0 transition-opacity duration-300"
                    : "scale-100 opacity-100 shadow-sm",
                  // Trạng thái bình thường
                  !isSelected &&
                    !tile.isWrong &&
                    "border-border bg-card hover:bg-muted/40 hover:border-rose-400",
                  // Trạng thái đang được chọn
                  isSelected &&
                    "scale-105 border-rose-500 bg-rose-500/10 text-rose-700 shadow-md ring-2 ring-rose-500 dark:text-rose-300",
                  // Trạng thái ghép sai (rung lắc)
                  tile.isWrong &&
                    "animate-bounce border-rose-600 bg-rose-500/20 text-rose-600"
                )}
              >
                {tile.type === "term" ? (
                  <>
                    <span className="font-japanese text-foreground text-lg font-black sm:text-xl">
                      {tile.text}
                    </span>
                    {tile.subText && (
                      <span className="font-japanese text-muted-foreground mt-1 text-xs font-medium">
                        {tile.subText}
                      </span>
                    )}
                    <Badge
                      variant="outline"
                      className="mt-2 text-[9px] font-semibold"
                    >
                      Tiếng Nhật
                    </Badge>
                  </>
                ) : (
                  <>
                    <span className="text-foreground text-sm leading-snug font-bold sm:text-base">
                      {tile.text}
                    </span>
                    <Badge
                      variant="outline"
                      className="mt-2 text-[9px] font-semibold"
                    >
                      Định nghĩa
                    </Badge>
                  </>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        /* VICTORY / RESULTS CARD */
        <div className="border-border bg-card overflow-hidden rounded-3xl border p-6 text-center shadow-xl sm:p-8">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white shadow-xl">
            <Trophy className="size-10" />
          </div>

          {isNewRecord ? (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-4 py-1 text-xs font-black text-amber-600 dark:text-amber-400">
              <Flame className="size-4 fill-current text-amber-500" />
              <span>KỶ LỤC MỚI CỦA BẠN! 🎉</span>
            </div>
          ) : (
            <span className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600">
              Hoàn thành xuất sắc!
            </span>
          )}

          <h1 className="text-foreground mt-2 text-3xl font-black sm:text-4xl">
            Ghép đôi thành công!
          </h1>
          <p className="text-muted-foreground mt-1 text-xs font-medium">
            Bạn đã ghép đúng toàn bộ {totalPairs} cặp từ vựng trong bộ thẻ.
          </p>

          {/* Big Time Metric */}
          <div className="border-border/60 from-muted/30 to-background my-6 rounded-2xl border bg-gradient-to-b p-6">
            <div className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Thời gian hoàn thành
            </div>
            <div className="text-foreground mt-1 text-5xl font-black sm:text-6xl">
              {secondsFormatted}
              <span className="text-3xl text-rose-500 sm:text-4xl">s</span>
            </div>

            <div className="border-border/60 mt-6 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-muted-foreground text-xs font-medium">
                  Số cặp đã ghép
                </div>
                <div className="text-foreground mt-0.5 text-lg font-bold">
                  {totalPairs} cặp
                </div>
              </div>

              <div className="text-center">
                <div className="text-muted-foreground text-xs font-medium">
                  Số lần phạt (+1s)
                </div>
                <div className="mt-0.5 text-lg font-bold text-rose-500">
                  {penaltyCount} lần
                </div>
              </div>

              <div className="col-span-2 text-center sm:col-span-1">
                <div className="text-muted-foreground text-xs font-medium">
                  Kỷ lục cá nhân (PB)
                </div>
                <div className="text-foreground mt-0.5 text-lg font-bold">
                  {personalBestSecs !== null ? `${personalBestSecs}s` : "--"}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => startNewGame(allCards)}
              className="gap-2 rounded-xl bg-rose-600 font-bold text-white shadow-xs hover:bg-rose-700"
            >
              <Zap className="size-4 fill-current" />
              <span>Chơi lại ván mới</span>
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
      )}
    </div>
  )
}
