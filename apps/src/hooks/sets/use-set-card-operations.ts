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
import { useBatchSelection, useAudioPronounce } from "@/hooks/common"

interface UseSetCardOperationsProps {
  cards: CardItem[]
}

export function useSetCardOperations({ cards }: UseSetCardOperationsProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Tìm kiếm thẻ
  const [searchCard, setSearchCard] = React.useState("")

  // Tái sử dụng Shared Hook: useBatchSelection
  const {
    selectedIds: selectedCardIds,
    toggle: toggleSelectCard,
    toggleAll: toggleSelectAll,
    deselectAll: clearSelection,
  } = useBatchSelection<CardItem>({ items: cards })

  // Tái sử dụng Shared Hook: useAudioPronounce
  const { speak: speakJapanese } = useAudioPronounce()

  // Trạng thái Modals & Dialogs
  const [cardModalOpen, setCardModalOpen] = React.useState(false)
  const [editingCard, setEditingCard] = React.useState<CardItem | null>(null)
  const [editSetModalOpen, setEditSetModalOpen] = React.useState(false)
  const [cardToDelete, setCardToDelete] = React.useState<CardItem | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  // Trạng thái gán nhãn hàng loạt
  const [bulkTagModalOpen, setBulkTagModalOpen] = React.useState(false)
  const [selectedTagIdForBulk, setSelectedTagIdForBulk] = React.useState("")

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
        clearSelection()
        router.refresh()
      } catch {
        toast.error("Lỗi khi xoá hàng loạt")
      } finally {
        setBulkDeleteOpen(false)
      }
    })
  }, [selectedCardIds, clearSelection, router])

  // Gán nhãn nhiều thẻ (Bulk Tag)
  const handleBulkTag = React.useCallback(() => {
    if (!selectedTagIdForBulk) {
      toast.error("Vui lòng chọn một nhãn")
      return
    }

    const cardIds = Array.from(selectedCardIds)
    if (cardIds.length === 0) {
      toast.error("Chưa chọn thẻ nào để gán nhãn")
      return
    }

    startTransition(async () => {
      try {
        const res = await bulkTagCardsAction({
          cardIds,
          tagIds: [selectedTagIdForBulk],
          action: "add",
        })

        if (res.success) {
          toast.success(`Đã gán nhãn cho ${cardIds.length} thẻ`)
          clearSelection()
          setBulkTagModalOpen(false)
          setSelectedTagIdForBulk("")
          router.refresh()
        } else {
          toast.error(res.error || "Gán nhãn thất bại")
        }
      } catch {
        toast.error("Lỗi khi gán nhãn hàng loạt")
      }
    })
  }, [selectedCardIds, selectedTagIdForBulk, clearSelection, router])

  // Lọc thẻ theo từ khóa tìm kiếm
  const filteredCards = React.useMemo(() => {
    if (!searchCard.trim()) return cards
    const q = searchCard.toLowerCase().trim()
    return cards.filter(
      (c) =>
        c.term.toLowerCase().includes(q) ||
        c.reading.toLowerCase().includes(q) ||
        c.definition.toLowerCase().includes(q)
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
