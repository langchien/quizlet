"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  deleteCardAction,
  duplicateCardAction,
  bulkTagCardsAction,
} from "@/actions/cards"
import type { CardItem } from "@/types/set-detail"

interface UseSetCardOperationsProps {
  cards: CardItem[]
}

export function useSetCardOperations({ cards }: UseSetCardOperationsProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Tìm kiếm thẻ
  const [searchCard, setSearchCard] = React.useState("")

  // Chọn thẻ (Selection)
  const [selectedCardIds, setSelectedCardIds] = React.useState<Set<string>>(
    new Set()
  )

  // Trạng thái Modals & Dialogs
  const [cardModalOpen, setCardModalOpen] = React.useState(false)
  const [editingCard, setEditingCard] = React.useState<CardItem | null>(null)
  const [editSetModalOpen, setEditSetModalOpen] = React.useState(false)
  const [cardToDelete, setCardToDelete] = React.useState<CardItem | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  // Trạng thái gán nhãn hàng loạt
  const [bulkTagModalOpen, setBulkTagModalOpen] = React.useState(false)
  const [selectedTagIdForBulk, setSelectedTagIdForBulk] = React.useState("")

  // Phát âm tiếng Nhật (TTS)
  const speakJapanese = React.useCallback((text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ja-JP"
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    } else {
      toast.error("Trình duyệt không hỗ trợ phát âm tự động")
    }
  }, [])

  // Xử lý chọn tất cả / bỏ chọn tất cả
  const toggleSelectAll = React.useCallback(() => {
    if (selectedCardIds.size === cards.length) {
      setSelectedCardIds(new Set())
    } else {
      setSelectedCardIds(new Set(cards.map((c) => c.id)))
    }
  }, [cards, selectedCardIds.size])

  // Xử lý chọn từng thẻ
  const toggleSelectCard = React.useCallback((id: string) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const clearSelection = React.useCallback(() => {
    setSelectedCardIds(new Set())
  }, [])

  // Xoá 1 thẻ
  const confirmDeleteCard = React.useCallback(() => {
    if (!cardToDelete) return
    startTransition(async () => {
      try {
        const res = await deleteCardAction(cardToDelete.id)
        if (res.success) {
          toast.success("Đã xoá thẻ thành công")
          router.refresh()
        } else {
          toast.error(res.error || "Xoá thẻ thất bại")
        }
      } catch {
        toast.error("Lỗi khi xoá thẻ")
      } finally {
        setCardToDelete(null)
      }
    })
  }, [cardToDelete, router])

  // Nhân bản 1 thẻ
  const handleDuplicateCard = React.useCallback(
    (id: string) => {
      startTransition(async () => {
        try {
          const res = await duplicateCardAction(id)
          if (res.success) {
            toast.success("Đã nhân bản thẻ thành công")
            router.refresh()
          } else {
            toast.error(res.error || "Nhân bản thẻ thất bại")
          }
        } catch {
          toast.error("Lỗi khi nhân bản thẻ")
        }
      })
    },
    [router]
  )

  // Xoá nhiều thẻ (Bulk Delete)
  const confirmBulkDelete = React.useCallback(() => {
    const ids = Array.from(selectedCardIds)
    startTransition(async () => {
      try {
        await Promise.all(ids.map((id) => deleteCardAction(id)))
        toast.success(`Đã xoá ${ids.length} thẻ thành công`)
        setSelectedCardIds(new Set())
        router.refresh()
      } catch {
        toast.error("Lỗi khi xoá hàng loạt")
      } finally {
        setBulkDeleteOpen(false)
      }
    })
  }, [selectedCardIds, router])

  // Gán nhãn nhiều thẻ (Bulk Tag)
  const handleBulkTag = React.useCallback(() => {
    if (!selectedTagIdForBulk) {
      toast.error("Vui lòng chọn một nhãn")
      return
    }

    startTransition(async () => {
      try {
        const res = await bulkTagCardsAction({
          cardIds: Array.from(selectedCardIds),
          tagIds: [selectedTagIdForBulk],
          action: "add",
        })

        if (res.success) {
          toast.success("Đã gán nhãn cho các thẻ đã chọn")
          setBulkTagModalOpen(false)
          setSelectedTagIdForBulk("")
          router.refresh()
        } else {
          toast.error(res.error || "Gán nhãn thất bại")
        }
      } catch {
        toast.error("Lỗi khi gán nhãn")
      }
    })
  }, [selectedCardIds, selectedTagIdForBulk, router])

  // Danh sách thẻ sau khi lọc tìm kiếm
  const filteredCards = React.useMemo(() => {
    if (!searchCard.trim()) return cards
    const q = searchCard.toLowerCase()
    return cards.filter(
      (card) =>
        card.term.toLowerCase().includes(q) ||
        card.reading.toLowerCase().includes(q) ||
        card.definition.toLowerCase().includes(q) ||
        card.example?.toLowerCase().includes(q) ||
        card.tags.some((t) => t.name.toLowerCase().includes(q))
    )
  }, [cards, searchCard])

  return {
    searchCard,
    setSearchCard,
    filteredCards,
    selectedCardIds,
    toggleSelectAll,
    toggleSelectCard,
    clearSelection,
    cardModalOpen,
    setCardModalOpen,
    editingCard,
    setEditingCard,
    editSetModalOpen,
    setEditSetModalOpen,
    cardToDelete,
    setCardToDelete,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    bulkTagModalOpen,
    setBulkTagModalOpen,
    selectedTagIdForBulk,
    setSelectedTagIdForBulk,
    isPending,
    speakJapanese,
    confirmDeleteCard,
    handleDuplicateCard,
    confirmBulkDelete,
    handleBulkTag,
  }
}
