"use client"

import * as React from "react"
import { toast } from "sonner"
import type { AnkiPreviewDeck, AnkiFieldMapping } from "@/schemas/import-export"
import { previewAnkiAction, importAnkiAction } from "@/actions/import"

export interface UseAnkiImportOptions {
  onSuccess?: (data: {
    setId: string
    setName: string
    cardCount: number
  }) => void
}

export function useAnkiImport(options?: UseAnkiImportOptions) {
  const [file, setFile] = React.useState<File | null>(null)
  const [loadingPreview, setLoadingPreview] = React.useState(false)
  const [decks, setDecks] = React.useState<AnkiPreviewDeck[]>([])
  const [selectedDeckId, setSelectedDeckId] = React.useState<string>("")
  const [fieldMapping, setFieldMapping] = React.useState<AnkiFieldMapping>({})
  const [setName, setSetName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [folderId, setFolderId] = React.useState("")
  const [tags, setTags] = React.useState("anki")
  const [importing, setImporting] = React.useState(false)

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile)
    setLoadingPreview(true)
    setDecks([])

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const res = await previewAnkiAction(formData)
      if (!res.success) {
        toast.error(res.error || "Không thể đọc file Anki .apkg")
        return
      }

      const parsedDecks: AnkiPreviewDeck[] =
        (res.data?.decks as AnkiPreviewDeck[]) || []
      setDecks(parsedDecks)
      if (parsedDecks.length > 0) {
        const firstDeck = parsedDecks[0]
        setSelectedDeckId(String(firstDeck.id))
        setSetName(firstDeck.name)
        setFieldMapping(firstDeck.suggestedMapping || {})
      }
      toast.success(
        `Đã đọc thành công ${parsedDecks.length} bộ thẻ từ file .apkg!`
      )
    } catch (err) {
      console.error(err)
      toast.error("Lỗi khi tải và phân tích file Anki.")
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleSelectDeck = (deckIdStr: string) => {
    setSelectedDeckId(deckIdStr)
    const deck = decks.find((d) => String(d.id) === deckIdStr)
    if (deck) {
      setSetName(deck.name)
      setFieldMapping(deck.suggestedMapping || {})
    }
  }

  const selectedDeck = React.useMemo(() => {
    return decks.find((d) => String(d.id) === selectedDeckId) || decks[0]
  }, [decks, selectedDeckId])

  const handleImport = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file Anki (.apkg)")
      return
    }
    if (!setName.trim()) {
      toast.error("Vui lòng nhập tên bộ thẻ")
      return
    }

    setImporting(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("setName", setName.trim())
    if (description.trim()) formData.append("description", description.trim())
    if (folderId) formData.append("folderId", folderId)
    if (selectedDeckId) formData.append("deckId", selectedDeckId)
    if (tags.trim()) formData.append("tags", tags.trim())
    formData.append("fieldMapping", JSON.stringify(fieldMapping))

    try {
      const res = await importAnkiAction(formData)
      if (!res.success || !res.data) {
        toast.error(res.error || "Nhập bộ thẻ Anki thất bại")
        return
      }

      const data = res.data
      toast.success(
        `Đã tạo thành công bộ thẻ "${data.setName}" với ${data.cardCount} thẻ!`
      )
      options?.onSuccess?.(data)
    } catch (err) {
      console.error(err)
      toast.error("Lỗi máy chủ khi import Anki.")
    } finally {
      setImporting(false)
    }
  }

  return {
    file,
    loadingPreview,
    decks,
    selectedDeckId,
    selectedDeck,
    fieldMapping,
    setName,
    description,
    folderId,
    tags,
    importing,
    setFieldMapping,
    setSetName,
    setDescription,
    setFolderId,
    setTags,
    handleFileChange,
    handleSelectDeck,
    handleImport,
  }
}
