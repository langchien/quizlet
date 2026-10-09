"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"

interface TestWrittenInputProps {
  userAnswer?: string
  onAnswer: (val: string) => void
}

export function TestWrittenInput({
  userAnswer,
  onAnswer,
}: TestWrittenInputProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3">
      <Input
        placeholder="Gõ từ tiếng Nhật (Kanji hoặc Hiragana)..."
        value={userAnswer || ""}
        onChange={(e) => onAnswer(e.target.value)}
        autoFocus
        className="h-13 rounded-2xl text-center text-lg font-bold shadow-inner"
      />
      <p className="text-muted-foreground text-center text-xs">
        Bạn có thể gõ bằng chữ Hán (Kanji) hoặc Hiragana
      </p>
    </div>
  )
}
