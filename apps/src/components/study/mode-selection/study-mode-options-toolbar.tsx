"use client"

import * as React from "react"
import { SlidersHorizontal } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StudyOptionSwitchCard } from "./study-option-switch-card"
import { StudyOptionSelectCard } from "./study-option-select-card"

export interface StudyModeTagItem {
  id: string
  name: string
  color?: string
}

interface StudyModeOptionsToolbarProps {
  isReverse: boolean
  setIsReverse: (val: boolean) => void
  isShuffle: boolean
  setIsShuffle: (val: boolean) => void
  selectedStatus: string
  setSelectedStatus: (val: string) => void
  selectedTagId: string
  setSelectedTagId: (val: string) => void
  tags: StudyModeTagItem[]
}

export function StudyModeOptionsToolbar({
  isReverse,
  setIsReverse,
  isShuffle,
  setIsShuffle,
  selectedStatus,
  setSelectedStatus,
  selectedTagId,
  setSelectedTagId,
  tags,
}: StudyModeOptionsToolbarProps) {
  return (
    <div className="border-border bg-card/60 rounded-3xl border p-5 shadow-2xs">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="text-primary size-4" />
        <h2 className="text-foreground text-sm font-bold">
          Tùy chọn ôn tập chung
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Đảo mặt thẻ */}
        <StudyOptionSwitchCard
          id="opt-reverse"
          label="Đảo mặt thẻ (Reverse)"
          description="Hỏi tiếng Việt → tiếng Nhật"
          checked={isReverse}
          onCheckedChange={setIsReverse}
        />

        {/* 2. Xáo trộn thứ tự */}
        <StudyOptionSwitchCard
          id="opt-shuffle"
          label="Xáo trộn thứ tự"
          description="Đổi vị trí ngẫu nhiên"
          checked={isShuffle}
          onCheckedChange={setIsShuffle}
        />

        {/* 3. Lọc theo SRS status */}
        <StudyOptionSelectCard label="Trạng thái SRS">
          <Select
            value={selectedStatus}
            onValueChange={(val) => val && setSelectedStatus(val)}
          >
            <SelectTrigger className="h-8 w-full text-xs font-medium">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Tất cả trạng thái</SelectItem>
              <SelectItem value="New">Thẻ mới (New)</SelectItem>
              <SelectItem value="Learning">Đang học (Learning)</SelectItem>
              <SelectItem value="Review">Cần ôn (Review)</SelectItem>
              <SelectItem value="Mastered">Đã thuộc (Mastered)</SelectItem>
            </SelectContent>
          </Select>
        </StudyOptionSelectCard>

        {/* 4. Lọc theo nhãn (Tags) */}
        <StudyOptionSelectCard label="Lọc theo nhãn (Tag)">
          <Select
            value={selectedTagId}
            onValueChange={(val) => val && setSelectedTagId(val)}
          >
            <SelectTrigger className="h-8 w-full text-xs font-medium">
              <SelectValue placeholder="Tất cả các nhãn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Tất cả các nhãn</SelectItem>
              {tags.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  🏷️ {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </StudyOptionSelectCard>
      </div>
    </div>
  )
}
