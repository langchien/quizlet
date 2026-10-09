"use client"

import * as React from "react"
import { toast } from "sonner"
import { importJSONAction } from "@/actions/import"

export interface ParsedJsonSet {
  setName?: string
  name?: string
  cards?: Array<Record<string, unknown>>
}

export interface UseJsonImportOptions {
  onSuccess?: (data: { setId?: string; importedCount?: number }) => void
}

export function useJsonImport(options?: UseJsonImportOptions) {
  const [file, setFile] = React.useState<File | null>(null)
  const [content, setContent] = React.useState("")
  const [parsedSets, setParsedSets] = React.useState<ParsedJsonSet[] | null>(
    null
  )
  const [importing, setImporting] = React.useState(false)

  const parseJsonText = (text: string) => {
    try {
      const parsed = JSON.parse(text)
      const sets = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.studySets)
          ? parsed.studySets
          : Array.isArray(parsed.sets)
            ? parsed.sets
            : [parsed]
      setParsedSets(sets as ParsedJsonSet[])
      return sets
    } catch {
      setParsedSets(null)
      return null
    }
  }

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile)
    try {
      const text = await selectedFile.text()
      setContent(text)
      const sets = parseJsonText(text)
      if (sets && sets.length > 0) {
        toast.success(`Đã nhận diện ${sets.length} bộ thẻ từ file JSON!`)
      } else {
        toast.error("File JSON không hợp lệ.")
      }
    } catch (e) {
      console.error(e)
      toast.error("File JSON không hợp lệ.")
      setParsedSets(null)
    }
  }

  const handleContentChange = (val: string) => {
    setContent(val)
    parseJsonText(val)
  }

  const handleImport = async () => {
    if (!content.trim()) {
      toast.error("Vui lòng chọn file JSON hoặc dán nội dung")
      return
    }

    setImporting(true)
    try {
      let parsed: unknown
      try {
        parsed = JSON.parse(content)
      } catch {
        toast.error("Nội dung JSON không đúng cú pháp")
        setImporting(false)
        return
      }

      const res = await importJSONAction(parsed)
      if (!res.success || !res.data) {
        toast.error(res.error || "Import JSON thất bại")
        return
      }

      const data = res.data
      toast.success(`Đã import thành công ${data.importedCount || 1} bộ thẻ!`)
      options?.onSuccess?.(data)
    } catch (err) {
      console.error(err)
      toast.error("Lỗi máy chủ khi import JSON.")
    } finally {
      setImporting(false)
    }
  }

  return {
    file,
    content,
    parsedSets,
    importing,
    handleFileChange,
    handleContentChange,
    handleImport,
  }
}
