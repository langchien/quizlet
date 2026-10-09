"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTTS } from "@/hooks/useTTS"
import {
  getMistakeCardsAction,
  startReviewMistakesAction,
} from "@/actions/study"
import type { JLPTLevel } from "@/generated/prisma/client"
import type { MistakeCard, MistakeReviewMode } from "@/types/mistakes"

interface UseMistakesNotebookProps {
  initialItems: MistakeCard[]
}

export function useMistakesNotebook({
  initialItems,
}: UseMistakesNotebookProps) {
  const router = useRouter()
  const { speak } = useTTS()

  const [items, setItems] = React.useState<MistakeCard[]>(initialItems)
  const [isFilterPending, startFilterTransition] = React.useTransition()

  // Filters & Sorting
  const [selectedSetId, setSelectedSetId] = React.useState<string>("all")
  const [selectedJLPT, setSelectedJLPT] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<string>("incorrectCount")

  // Launch Review Dialog
  const [launchModalOpen, setLaunchModalOpen] = React.useState(false)
  const [chosenMode, setChosenMode] =
    React.useState<MistakeReviewMode>("Flashcard")
  const [isStartingReview, setIsStartingReview] = React.useState(false)

  // Lọc danh sách Error Pool
  const handleFilterChange = React.useCallback(
    (newSetId = selectedSetId, newJLPT = selectedJLPT, newSortBy = sortBy) => {
      setSelectedSetId(newSetId)
      setSelectedJLPT(newJLPT)
      setSortBy(newSortBy)

      startFilterTransition(async () => {
        const res = await getMistakeCardsAction({
          studySetId: newSetId !== "all" ? newSetId : undefined,
          jlpt: newJLPT !== "all" ? (newJLPT as JLPTLevel) : undefined,
          sortBy: newSortBy,
        })

        if (res.success && res.data) {
          setItems(res.data as unknown as MistakeCard[])
        } else {
          toast.error(res.error || "Không thể tải danh sách lỗi sai.")
        }
      })
    },
    [selectedSetId, selectedJLPT, sortBy]
  )

  // Lấy danh sách unique StudySets từ initialItems để làm bộ lọc
  const uniqueSets = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const item of initialItems) {
      if (item.studySet) {
        map.set(item.studySet.id, item.studySet.name)
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [initialItems])

  // Bắt đầu phiên ôn tập lỗi sai
  const handleStartReviewSession = React.useCallback(async () => {
    setIsStartingReview(true)
    try {
      const res = await startReviewMistakesAction({
        studySetId: selectedSetId !== "all" ? selectedSetId : undefined,
        mode: chosenMode,
        shuffle: true,
      })

      if (res.success && res.data) {
        if (res.data.cards.length === 0) {
          toast.info("Không có thẻ nào để ôn tập.")
          return
        }

        const targetSetId =
          selectedSetId !== "all"
            ? selectedSetId
            : res.data.cards[0]?.studySetId
        if (targetSetId) {
          router.push(`/study/${targetSetId}/${chosenMode.toLowerCase()}`)
        } else {
          toast.success("Khởi tạo phiên ôn lỗi sai thành công")
        }
      } else {
        toast.error(res.error || "Lỗi khi khởi tạo phiên ôn tập.")
      }
    } catch (err) {
      console.error("Error starting mistakes session:", err)
      toast.error("Lỗi kết nối máy chủ.")
    } finally {
      setIsStartingReview(false)
      setLaunchModalOpen(false)
    }
  }, [selectedSetId, chosenMode, router])

  return {
    items,
    isFilterPending,
    selectedSetId,
    selectedJLPT,
    sortBy,
    uniqueSets,
    launchModalOpen,
    setLaunchModalOpen,
    chosenMode,
    setChosenMode,
    isStartingReview,
    handleFilterChange,
    handleStartReviewSession,
    speak,
  }
}
