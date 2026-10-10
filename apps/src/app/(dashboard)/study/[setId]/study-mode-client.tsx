"use client"

import * as React from "react"
import {
  StudyModeHeader,
  StudyModeOptionsToolbar,
  StudyModeGrid,
  type SetDetailOverview,
  type StudyModeTagItem,
} from "@/components/study/mode-selection"
import { useStudyModeSelection } from "@/hooks/study"

interface StudyModeClientProps {
  setDetail: SetDetailOverview
  tags: StudyModeTagItem[]
}

export function StudyModeClient({ setDetail, tags }: StudyModeClientProps) {
  const {
    isShuffle,
    setIsShuffle,
    isReverse,
    setIsReverse,
    selectedStatus,
    setSelectedStatus,
    selectedTagId,
    setSelectedTagId,
    studyModes,
  } = useStudyModeSelection(setDetail.id)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-20">
      {/* Set Overview Header */}
      <StudyModeHeader setDetail={setDetail} />

      {/* Tùy chọn học tập (Study Options Panel) */}
      <StudyModeOptionsToolbar
        isReverse={isReverse}
        setIsReverse={setIsReverse}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedTagId={selectedTagId}
        setSelectedTagId={setSelectedTagId}
        tags={tags}
      />

      {/* 6 Study Modes Cards Grid */}
      <StudyModeGrid modes={studyModes} />
    </div>
  )
}
