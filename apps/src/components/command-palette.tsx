"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  BookOpen,
  Folder,
  Tag,
  Sparkles,
  Plus,
  BarChart2,
  Calendar,
  X,
  Layers,
  ArrowRight,
} from "lucide-react"

interface SearchResults {
  sets: Array<{
    id: string
    name: string
    description?: string | null
    cardCount: number
    folder?: { id: string; name: string } | null
  }>
  cards: Array<{
    id: string
    term: string
    reading: string
    definition: string
    studySetId: string
    studySetName: string
    tags?: Array<{ id: string; name: string; color: string }>
  }>
  folders: Array<{
    id: string
    name: string
    description?: string | null
    _count?: { studySets: number; children: number }
  }>
  tags: Array<{
    id: string
    name: string
    color: string
    cardCount: number
  }>
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenCreateSet?: () => void
  onOpenCreateFolder?: () => void
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenCreateSet,
  onOpenCreateFolder,
}: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<SearchResults | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Lắng nghe phím tắt Ctrl+K / Cmd+K
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
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
      setResults(null)
    }
  }, [open])

  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}&limit=5`
        )
        if (res.ok) {
          const data = await res.json()
          setResults(data.results)
        }
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (url: string) => {
    onOpenChange(false)
    router.push(url)
  }

  if (!open) return null

  const hasResults =
    results &&
    (results.sets.length > 0 ||
      results.cards.length > 0 ||
      results.folders.length > 0 ||
      results.tags.length > 0)

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
        <div className="border-border flex items-center border-b px-4 py-3">
          <Search className="text-muted-foreground mr-3 size-5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bộ thẻ, từ vựng (Kanji, Romaji, Hiragana), thư mục, nhãn..."
            className="placeholder:text-muted-foreground text-foreground w-full bg-transparent text-sm outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:bg-muted hover:text-foreground mr-2 rounded p-1"
            >
              <X className="size-4" />
            </button>
          )}
          <span className="bg-muted text-muted-foreground border-border rounded border px-1.5 py-0.5 text-[10px] font-semibold">
            ESC
          </span>
        </div>

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
            <div>
              <div className="text-muted-foreground px-2 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
                Thao tác nhanh
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {onOpenCreateSet && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false)
                      onOpenCreateSet()
                    }}
                    className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
                  >
                    <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg">
                      <Plus className="size-4" />
                    </div>
                    <span>Tạo bộ thẻ mới</span>
                  </button>
                )}
                {onOpenCreateFolder && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false)
                      onOpenCreateFolder()
                    }}
                    className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
                  >
                    <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <Folder className="size-4" />
                    </div>
                    <span>Tạo thư mục mới</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSelect("/library")}
                  className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
                >
                  <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Layers className="size-4" />
                  </div>
                  <span>Thư viện bộ thẻ</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect("/tags")}
                  className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
                >
                  <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <Tag className="size-4" />
                  </div>
                  <span>Quản lý nhãn</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect("/calendar")}
                  className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
                >
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Calendar className="size-4" />
                  </div>
                  <span>Lịch ôn tập</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect("/stats")}
                  className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors"
                >
                  <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                    <BarChart2 className="size-4" />
                  </div>
                  <span>Thống kê tiến độ</span>
                </button>
              </div>
            </div>
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
                  {/* Sets */}
                  {results.sets.length > 0 && (
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
                        <BookOpen className="text-primary size-3.5" />
                        <span>Bộ thẻ ({results.sets.length})</span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {results.sets.map((set) => (
                          <button
                            key={set.id}
                            type="button"
                            onClick={() => handleSelect(`/sets/${set.id}`)}
                            className="hover:bg-muted group flex w-full items-center justify-between rounded-xl p-2 text-left transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-foreground group-hover:text-primary flex items-center gap-2 text-xs font-semibold transition-colors">
                                <span>{set.name}</span>
                                {set.folder && (
                                  <span className="bg-muted-foreground/10 text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">
                                    📁 {set.folder.name}
                                  </span>
                                )}
                              </div>
                              {set.description && (
                                <div className="text-muted-foreground truncate text-[11px]">
                                  {set.description}
                                </div>
                              )}
                            </div>
                            <div className="text-muted-foreground ml-2 shrink-0 text-[11px]">
                              {set.cardCount} thẻ
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cards */}
                  {results.cards.length > 0 && (
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
                        <Sparkles className="size-3.5 text-amber-500" />
                        <span>Từ vựng & Thẻ học ({results.cards.length})</span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {results.cards.map((card) => (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() =>
                              handleSelect(`/sets/${card.studySetId}`)
                            }
                            className="hover:bg-muted group flex w-full items-center justify-between rounded-xl p-2 text-left transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-foreground group-hover:text-primary font-japanese text-sm font-bold transition-colors">
                                  {card.term}
                                </span>
                                {card.reading && (
                                  <span className="text-muted-foreground text-xs">
                                    【{card.reading}】
                                  </span>
                                )}
                              </div>
                              <div className="text-foreground/80 mt-0.5 truncate text-xs">
                                {card.definition}
                              </div>
                            </div>
                            <div className="bg-primary/10 text-primary ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px]">
                              {card.studySetName}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Folders */}
                  {results.folders.length > 0 && (
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
                        <Folder className="size-3.5 text-blue-500" />
                        <span>Thư mục ({results.folders.length})</span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {results.folders.map((folder) => (
                          <button
                            key={folder.id}
                            type="button"
                            onClick={() =>
                              handleSelect(`/library?folderId=${folder.id}`)
                            }
                            className="hover:bg-muted group flex w-full items-center justify-between rounded-xl p-2 text-left transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-foreground text-xs font-semibold transition-colors group-hover:text-blue-500">
                                📁 {folder.name}
                              </div>
                              {folder.description && (
                                <div className="text-muted-foreground truncate text-[11px]">
                                  {folder.description}
                                </div>
                              )}
                            </div>
                            <div className="text-muted-foreground ml-2 shrink-0 text-[11px]">
                              {folder._count?.studySets ?? 0} bộ thẻ
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {results.tags.length > 0 && (
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
                        <Tag className="size-3.5 text-purple-500" />
                        <span>Nhãn phân loại ({results.tags.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-1">
                        {results.tags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleSelect(`/tags/${tag.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80"
                            style={{
                              borderColor: `${tag.color}40`,
                              backgroundColor: `${tag.color}15`,
                              color: tag.color,
                            }}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span>{tag.name}</span>
                            <span className="text-[10px] opacity-70">
                              ({tag.cardCount})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="border-border/60 bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-[11px]">
          <span>
            Dùng <strong>↑</strong> <strong>↓</strong> để chọn,{" "}
            <strong>Enter</strong> để mở
          </span>
          <span className="flex items-center gap-1">
            <span>NihoMemo Search</span>
            <ArrowRight className="size-3" />
          </span>
        </div>
      </div>
    </div>
  )
}
