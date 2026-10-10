"use client"

import * as React from "react"
import { useCommandSearch } from "@/hooks/command"
import {
  CommandHeader,
  CommandQuickActions,
  CommandSetsGroup,
  CommandCardsGroup,
  CommandFoldersGroup,
  CommandTagsGroup,
  CommandFooter,
  CommandLoading,
  CommandEmptyState,
} from "@/components/command"
import type { CommandPaletteProps } from "@/types/command-palette"

export function CommandPalette({
  open,
  onOpenChange,
  onOpenCreateSet,
  onOpenCreateFolder,
}: CommandPaletteProps) {
  const {
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
  } = useCommandSearch({
    open,
    onOpenChange,
    onOpenCreateSet,
    onOpenCreateFolder,
  })

  if (!open) return null

  return (
    <div className="animate-in fade-in-0 fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 duration-150 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Box */}
      <div
        className="animate-in zoom-in-95 border-border bg-card relative z-50 w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <CommandHeader
          inputRef={inputRef}
          query={query}
          onQueryChange={setQuery}
          onClearQuery={clearQuery}
        />

        {/* Search Content */}
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-3">
          {loading && <CommandLoading />}

          {/* Quick Actions (Khi chưa gõ từ khoá) */}
          {!query.trim() && (
            <CommandQuickActions
              onSelect={handleSelect}
              onOpenCreateSet={onOpenCreateSet ? handleCreateSet : undefined}
              onOpenCreateFolder={
                onOpenCreateFolder ? handleCreateFolder : undefined
              }
            />
          )}

          {/* Kết quả tìm kiếm */}
          {query.trim() && !loading && (
            <>
              {!hasResults ? (
                <CommandEmptyState query={query} />
              ) : (
                <div className="flex flex-col gap-4">
                  {results && (
                    <>
                      <CommandSetsGroup
                        sets={results.sets}
                        onSelect={handleSelect}
                      />
                      <CommandCardsGroup
                        cards={results.cards}
                        onSelect={handleSelect}
                      />
                      <CommandFoldersGroup
                        folders={results.folders}
                        onSelect={handleSelect}
                      />
                      <CommandTagsGroup
                        tags={results.tags}
                        onSelect={handleSelect}
                      />
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <CommandFooter />
      </div>
    </div>
  )
}
