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
    loading,
    results,
    inputRef,
    handleSelect,
    hasResults,
  } = useCommandSearch({ open, onOpenChange })

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
        className="border-border bg-card animate-in zoom-in-95 relative z-50 w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <CommandHeader
          inputRef={inputRef}
          query={query}
          onQueryChange={setQuery}
        />

        {/* Search Content */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-3">
          {loading && (
            <div className="text-muted-foreground py-8 text-center text-xs">
              <span className="mr-2 inline-block animate-spin">⏳</span>
              Đang tìm kiếm...
            </div>
          )}

          {/* Quick Actions (Khi chưa gõ từ khoá) */}
          {!query.trim() && (
            <CommandQuickActions
              onSelect={handleSelect}
              onOpenCreateSet={
                onOpenCreateSet
                  ? () => {
                      onOpenChange(false)
                      onOpenCreateSet()
                    }
                  : undefined
              }
              onOpenCreateFolder={
                onOpenCreateFolder
                  ? () => {
                      onOpenChange(false)
                      onOpenCreateFolder()
                    }
                  : undefined
              }
            />
          )}

          {/* Kết quả tìm kiếm */}
          {query.trim() && !loading && (
            <>
              {!hasResults ? (
                <div className="text-muted-foreground py-10 text-center text-sm">
                  Không tìm thấy kết quả phù hợp cho &quot;{query}&quot;
                </div>
              ) : (
                <div className="space-y-4">
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
