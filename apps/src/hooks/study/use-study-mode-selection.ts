"use client"

import * as React from "react"
import {
  Layers,
  BrainCircuit,
  Pencil,
  CheckSquare,
  Sparkles,
  Headphones,
} from "lucide-react"
import type { StudyModeItem } from "@/components/study/mode-selection"

export function useStudyModeSelection(setId: string) {
  const [isShuffle, setIsShuffle] = React.useState(false)
  const [isReverse, setIsReverse] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = React.useState<string>("All")
  const [selectedTagId, setSelectedTagId] = React.useState<string>("All")

  // Tạo query string cho các chế độ học
  const getQueryString = React.useCallback(() => {
    const params = new URLSearchParams()
    if (isShuffle) params.set("shuffle", "true")
    if (isReverse) params.set("reverse", "true")
    if (selectedStatus !== "All") params.set("status", selectedStatus)
    if (selectedTagId !== "All") params.set("tag", selectedTagId)
    const qs = params.toString()
    return qs ? `?${qs}` : ""
  }, [isShuffle, isReverse, selectedStatus, selectedTagId])

  const queryString = getQueryString()

  // 6 Chế độ học tập
  const studyModes: StudyModeItem[] = React.useMemo(
    () => [
      {
        id: "flashcard",
        title: "Flashcard (Lật thẻ 3D)",
        desc: "Lật thẻ trực quan, ghi nhớ nhanh từ vựng & furigana với hiệu ứng 3D và phát âm tự động.",
        icon: Layers,
        href: `/study/${setId}/flashcard${queryString}`,
        color: "from-blue-600 to-indigo-600",
        badge: "Phổ biến nhất",
        accent: "text-blue-500",
        bgHover: "hover:border-blue-500/50",
      },
      {
        id: "learn",
        title: "Learn (Học thích ứng)",
        desc: "Thuật toán học thông minh kết hợp Trắc nghiệm, Đúng/Sai và Điền từ thích ứng theo năng lực.",
        icon: BrainCircuit,
        href: `/study/${setId}/learn${queryString}`,
        color: "from-emerald-600 to-teal-600",
        badge: "Hiệu quả cao",
        accent: "text-emerald-500",
        bgHover: "hover:border-emerald-500/50",
      },
      {
        id: "write",
        title: "Write (Luyện viết)",
        desc: "Rèn luyện trí nhớ qua việc gõ từ vựng tiếng Nhật, hỗ trợ kiểm tra lỗi chính tả và gợi ý chữ.",
        icon: Pencil,
        href: `/study/${setId}/write${queryString}`,
        color: "from-amber-500 to-orange-600",
        badge: "Ghi nhớ sâu",
        accent: "text-amber-500",
        bgHover: "hover:border-amber-500/50",
      },
      {
        id: "test",
        title: "Test (Kiểm tra)",
        desc: "Bài thi tổng hợp với đồng hồ đếm ngược, tùy chỉnh số lượng câu hỏi và chấm điểm chi tiết.",
        icon: CheckSquare,
        href: `/study/${setId}/test${queryString}`,
        color: "from-purple-600 to-pink-600",
        badge: "Đánh giá",
        accent: "text-purple-500",
        bgHover: "hover:border-purple-500/50",
      },
      {
        id: "match",
        title: "Match (Ghép đôi)",
        desc: "Trò chơi nối từ vựng tiếng Nhật với nghĩa tiếng Việt cực kỳ vui nhộn, cạnh tranh kỷ lục thời gian.",
        icon: Sparkles,
        href: `/study/${setId}/match${queryString}`,
        color: "from-rose-500 to-red-600",
        badge: "Trò chơi",
        accent: "text-rose-500",
        bgHover: "hover:border-rose-500/50",
      },
      {
        id: "listen",
        title: "Listen (Luyện nghe)",
        desc: "Nghe phát âm tiếng Nhật bản xứ với nhiều tốc độ và gõ lại để nâng cao phản xạ âm thanh.",
        icon: Headphones,
        href: `/study/${setId}/listen${queryString}`,
        color: "from-cyan-500 to-blue-600",
        badge: "Luyện nghe",
        accent: "text-cyan-500",
        bgHover: "hover:border-cyan-500/50",
      },
    ],
    [setId, queryString]
  )

  return {
    isShuffle,
    setIsShuffle,
    isReverse,
    setIsReverse,
    selectedStatus,
    setSelectedStatus,
    selectedTagId,
    setSelectedTagId,
    studyModes,
  }
}
