"use client"

import * as React from "react"
import { toast } from "sonner"
import { previewTextAction, importTextAction } from "@/actions/import"

export interface UseTextImportOptions {
  onSuccess?: (data: {
    setId: string
    setName: string
    cardCount: number
  }) => void
}

export function useTextImport(options?: UseTextImportOptions) {
  const [content, setContent] = React.useState("")
  const [termSeparator, setTermSeparator] = React.useState("\t")
  const [cardSeparator, setCardSeparator] = React.useState("\n")
  const [setName, setSetName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [folderId, setFolderId] = React.useState("")
  const [tags, setTags] = React.useState("")
  const [previewCards, setPreviewCards] = React.useState<
    Array<{ term: string; reading: string; definition: string }>
  >([])
  const [importing, setImporting] = React.useState(false)

  const parseAndPreview = React.useCallback(
    async (text: string, termSep: string, cardSep: string) => {
      if (!text.trim()) {
        setPreviewCards([])
        return
      }

      try {
        const res = await previewTextAction({
          content: text,
          termSeparator: termSep,
          cardSeparator: cardSep,
        })
        if (res.success && res.data) {
          setPreviewCards(res.data.sampleCards || [])
          setSetName((prev) => (prev ? prev : "Bộ thẻ nhập từ văn bản"))
        }
      } catch (e) {
        console.error("Lỗi xem trước văn bản:", e)
      }
    },
    []
  )

  const handleContentChange = (val: string) => {
    setContent(val)
    parseAndPreview(val, termSeparator, cardSeparator)
  }

  const handleTermSeparatorChange = (sep: string) => {
    setTermSeparator(sep)
    parseAndPreview(content, sep, cardSeparator)
  }

  const handleCardSeparatorChange = (sep: string) => {
    setCardSeparator(sep)
    parseAndPreview(content, termSeparator, sep)
  }

  const handleImport = async () => {
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung văn bản")
      return
    }
    if (!setName.trim()) {
      toast.error("Vui lòng nhập tên bộ thẻ")
      return
    }

    setImporting(true)
    try {
      const res = await importTextAction({
        setName: setName.trim(),
        description: description.trim() || undefined,
        folderId: folderId || undefined,
        content,
        termDefSeparator: termSeparator,
        cardSeparator,
        tags: tags
          .split(/[,;\s]+/)
          .map((t) => t.trim())
          .filter(Boolean),
      })

      if (!res.success || !res.data) {
        toast.error(res.error || "Nhập văn bản thất bại")
        return
      }

      const data = res.data
      toast.success(
        `Đã tạo bộ thẻ "${data.setName}" với ${data.cardCount} thẻ!`
      )
      options?.onSuccess?.(data)
    } catch (err) {
      console.error(err)
      toast.error("Lỗi máy chủ khi import văn bản.")
    } finally {
      setImporting(false)
    }
  }

  return {
    content,
    termSeparator,
    cardSeparator,
    setName,
    description,
    folderId,
    tags,
    previewCards,
    importing,
    handleContentChange,
    handleTermSeparatorChange,
    handleCardSeparatorChange,
    setSetName,
    setDescription,
    setFolderId,
    setTags,
    handleImport,
  }
}
