"use client"

import * as React from "react"

export interface UseDebounceSearchOptions {
  delay?: number
  initialValue?: string
  onSearchChange?: (debouncedValue: string) => void
}

export function useDebounceSearch(options?: UseDebounceSearchOptions) {
  const delay = options?.delay ?? 300
  const initialValue = options?.initialValue ?? ""

  const [searchTerm, setSearchTerm] = React.useState(initialValue)
  const [debouncedValue, setDebouncedValue] = React.useState(initialValue)
  const [isDebouncing, setIsDebouncing] = React.useState(false)

  React.useEffect(() => {
    setIsDebouncing(true)
    const handler = setTimeout(() => {
      setDebouncedValue(searchTerm)
      setIsDebouncing(false)
      options?.onSearchChange?.(searchTerm)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, delay, options])

  const clear = React.useCallback(() => {
    setSearchTerm("")
    setDebouncedValue("")
    setIsDebouncing(false)
  }, [])

  const reset = React.useCallback((value = "") => {
    setSearchTerm(value)
    setDebouncedValue(value)
    setIsDebouncing(false)
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    debouncedValue,
    isDebouncing,
    clear,
    reset,
  }
}
