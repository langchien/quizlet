"use client"

import * as React from "react"
import { toast } from "sonner"
import type { ColumnMapping } from "@/schemas/import-export"
import { previewCSVAction, importCSVAction } from "@/actions/import"

export interface UseCsvImportOptions {
  onSuccess?: (data: {
    setId: string
    setName: string
    cardCount: number
  }) => void
}

export function useCsvImport(options?: UseCsvImportOptions) {
  const [file, setFile] = React.useState<File | null>(null)
  const [rawContent, setRawContent] = React.useState("")
  const [delimiter, setDelimiter] = React.useState(",")
  const [hasHeader, setHasHeader] = React.useState(true)
  const [previewHeaders, setPreviewHeaders] = React.useState<string[]>([])
  const [previewRows, setPreviewRows] = React.useState<string[][]>([])
  const [columnMapping, setColumnMapping] = React.useState<ColumnMapping>({
    termIndex: 0,
    definitionIndex: 1,
  })
  const [setName, setSetName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [folderId, setFolderId] = React.useState("")
  const [tags, setTags] = React.useState("")
  const [loadingPreview, setLoadingPreview] = React.useState(false)
  const [importing, setImporting] = React.useState(false)

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile)
    setLoadingPreview(true)
    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("delimiter", delimiter)

    try {
      const res = await previewCSVAction(formData)
      if (!res.success || !res.data) {
        toast.error(res.error || "Không thể xem trước CSV")
        return
      }

      const prev = res.data
      setDelimiter(prev.detectedDelimiter || ",")
      setHasHeader(prev.hasHeader)
      setPreviewHeaders(prev.headers || [])
      setPreviewRows(prev.sampleRows || [])
      setColumnMapping(
        (prev.suggestedMapping as ColumnMapping) || {
          termIndex: 0,
          definitionIndex: 1,
        }
      )
      setSetName(selectedFile.name.replace(/\.[^/.]+$/, ""))
      toast.success(`Đã phân tích ${prev.totalRows} dòng từ CSV!`)
    } catch (err) {
      console.error(err)
      toast.error("Lỗi xem trước file CSV.")
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleTextChange = async (text: string) => {
    setRawContent(text)
    if (!text.trim()) return

    setLoadingPreview(true)
    try {
      const res = await previewCSVAction({
        content: text,
        delimiter,
      })
      if (res.success && res.data) {
        const prev = res.data
        setPreviewHeaders(prev.headers || [])
        setPreviewRows(prev.sampleRows || [])
        setColumnMapping(
          (prev.suggestedMapping as ColumnMapping) || {
            termIndex: 0,
            definitionIndex: 1,
          }
        )
        if (!setName) setSetName("Bộ thẻ CSV")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleDelimiterChange = (newDelimiter: string) => {
    setDelimiter(newDelimiter)
    if (file) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("delimiter", newDelimiter)
      setLoadingPreview(true)
      previewCSVAction(formData)
        .then((res) => {
          if (res.success && res.data) {
            setPreviewHeaders(res.data.headers || [])
            setPreviewRows(res.data.sampleRows || [])
          }
        })
        .finally(() => setLoadingPreview(false))
    } else if (rawContent.trim()) {
      setLoadingPreview(true)
      previewCSVAction({
        content: rawContent,
        delimiter: newDelimiter,
      })
        .then((res) => {
          if (res.success && res.data) {
            setPreviewHeaders(res.data.headers || [])
            setPreviewRows(res.data.sampleRows || [])
          }
        })
        .finally(() => setLoadingPreview(false))
    }
  }

  const handleImport = async () => {
    if (!file && !rawContent.trim()) {
      toast.error("Vui lòng chọn file CSV hoặc dán nội dung")
      return
    }
    if (!setName.trim()) {
      toast.error("Vui lòng nhập tên bộ thẻ")
      return
    }

    setImporting(true)
    try {
      let res: {
        success: boolean
        data?: { setId: string; setName: string; cardCount: number }
        error?: string
      }
      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("setName", setName.trim())
        if (description.trim())
          formData.append("description", description.trim())
        if (folderId) formData.append("folderId", folderId)
        formData.append("delimiter", delimiter)
        formData.append("hasHeader", String(hasHeader))
        formData.append("columnMapping", JSON.stringify(columnMapping))
        if (tags.trim()) formData.append("tags", tags.trim())

        res = await importCSVAction(formData)
      } else {
        res = await importCSVAction({
          setName: setName.trim(),
          description: description.trim() || undefined,
          folderId: folderId || undefined,
          content: rawContent,
          delimiter,
          hasHeader,
          columnMapping,
          tags: tags
            .split(/[,;\s]+/)
            .map((t) => t.trim())
            .filter(Boolean),
        })
      }

      if (!res.success || !res.data) {
        toast.error(res.error || "Import CSV thất bại")
        return
      }

      const data = res.data
      toast.success(
        `Đã tạo bộ thẻ "${data.setName}" với ${data.cardCount} thẻ!`
      )
      options?.onSuccess?.(data)
    } catch (err) {
      console.error(err)
      toast.error("Lỗi máy chủ khi import CSV.")
    } finally {
      setImporting(false)
    }
  }

  return {
    file,
    rawContent,
    delimiter,
    hasHeader,
    previewHeaders,
    previewRows,
    columnMapping,
    setName,
    description,
    folderId,
    tags,
    loadingPreview,
    importing,
    setDelimiter,
    handleDelimiterChange,
    setHasHeader,
    setColumnMapping,
    setSetName,
    setDescription,
    setFolderId,
    setTags,
    handleFileChange,
    handleTextChange,
    handleImport,
  }
}
