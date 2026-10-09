import type { getDashboardStats } from "@/lib/dal/stats"

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>

export interface RecentSetItem {
  id: string
  name: string
  description?: string | null
  cardCount: number
  updatedAt: Date | string
  folder?: { id: string; name: string } | null
}

export const STUDY_MODE_LABELS: Record<
  string,
  { label: string; icon: string }
> = {
  Flashcard: { label: "Flashcard", icon: "🃏" },
  Learn: { label: "Học thích ứng", icon: "📖" },
  Test: { label: "Kiểm tra", icon: "📝" },
  Match: { label: "Ghép từ", icon: "🧩" },
  Write: { label: "Viết đáp án", icon: "✍️" },
  Listen: { label: "Nghe & viết", icon: "🎧" },
}
