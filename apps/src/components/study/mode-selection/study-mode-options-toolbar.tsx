"use client"

import * as React from "react"
import { SlidersHorizontal } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
        <div className="border-border/60 bg-background/50 flex items-center justify-between rounded-2xl border p-3.5">
          <div className="flex flex-col gap-0.5">
            <Label
              htmlFor="opt-reverse"
              className="text-foreground cursor-pointer text-xs font-bold"
            >
              Đảo mặt thẻ (Reverse)
            </Label>
            <p className="text-muted-foreground text-[10px]">
              Hỏi tiếng Việt → tiếng Nhật
            </p>
          </div>
          <Switch
            id="opt-reverse"
            checked={isReverse}
            onCheckedChange={setIsReverse}
          />
        </div>

        {/* 2. Xáo trộn thứ tự */}
        <div className="border-border/60 bg-background/50 flex items-center justify-between rounded-2xl border p-3.5">
          <div className="flex flex-col gap-0.5">
            <Label
              htmlFor="opt-shuffle"
              className="text-foreground cursor-pointer text-xs font-bold"
            >
              Xáo trộn thứ tự
            </Label>
            <p className="text-muted-foreground text-[10px]">
              Đổi vị trí ngẫu nhiên
            </p>
          </div>
          <Switch
            id="opt-shuffle"
            checked={isShuffle}
            onCheckedChange={setIsShuffle}
          />
        </div>

        {/* 3. Lọc theo SRS status */}
        <div className="border-border/60 bg-background/50 flex flex-col gap-1.5 rounded-2xl border p-3.5">
          <Label className="text-foreground text-xs font-bold">
            Trạng thái SRS
          </Label>
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
        </div>

        {/* 4. Lọc theo nhãn (Tags) */}
        <div className="border-border/60 bg-background/50 flex flex-col gap-1.5 rounded-2xl border p-3.5">
          <Label className="text-foreground text-xs font-bold">
            Lọc theo nhãn (Tag)
          </Label>
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
        </div>
      </div>
    </div>
  )
}
