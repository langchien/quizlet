"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { globalSearchAction } from "@/actions/search"
import type { SearchResults } from "@/types/command-palette"

interface UseCommandSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenCreateSet?: () => void
  onOpenCreateFolder?: () => void
}

export function useCommandSearch({
  open,
  onOpenChange,
  onOpenCreateSet,
  onOpenCreateFolder,
}: UseCommandSearchProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<SearchResults | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Lắng nghe phím tắt Ctrl+K / Cmd+K và Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  // Focus input khi mở palette
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    } else {
      setQuery("")
      setResults(null)
    }
  }, [open])

  // Debounced search khi query thay đổi với race-condition protection
  React.useEffect(() => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      setResults(null)
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    const timer = setTimeout(async () => {
      try {
        const res = await globalSearchAction(trimmedQuery, 5)
        if (isMounted && res.success && res.data) {
          setResults(res.data.results as unknown as SearchResults)
        }
      } catch (err) {
        if (isMounted) {
          console.error("Search error:", err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }, 250)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [query])

  const handleSelect = React.useCallback(
    (url: string) => {
      onOpenChange(false)
      router.push(url)
    },
    [onOpenChange, router]
  )

  const handleCreateSet = React.useCallback(() => {
    onOpenChange(false)
    onOpenCreateSet?.()
  }, [onOpenChange, onOpenCreateSet])

  const handleCreateFolder = React.useCallback(() => {
    onOpenChange(false)
    onOpenCreateFolder?.()
  }, [onOpenChange, onOpenCreateFolder])

  const clearQuery = React.useCallback(() => {
    setQuery("")
  }, [])

  const hasResults = Boolean(
    results &&
    (results.sets.length > 0 ||
      results.cards.length > 0 ||
      results.folders.length > 0 ||
      results.tags.length > 0)
  )

  return {
    query,
    setQuery,
    clearQuery,
    loading,
    results,
    inputRef,
    handleSelect,
    handleCreateSet,
    handleCreateFolder,
    hasResults,
  }
}
