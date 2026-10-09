"use client"

import * as React from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { WriteStatus } from "@/types/write"

interface WriteInputFormProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  userTyped: string
  onUserTypedChange: (val: string) => void
  status: WriteStatus
  onCheckAnswer: () => void
  onNextCard: () => void
}

export function WriteInputForm({
  inputRef,
  userTyped,
  onUserTypedChange,
  status,
  onCheckAnswer,
  onNextCard,
}: WriteInputFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (status === "typing") {
      onCheckAnswer()
    } else {
      onNextCard()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-4"
    >
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Gõ tiếng Nhật (Kanji hoặc Hiragana)..."
          value={userTyped}
          onChange={(e) => onUserTypedChange(e.target.value)}
          disabled={status !== "typing"}
          autoFocus
          className={cn(
            "h-14 rounded-2xl pr-12 text-center text-lg font-bold shadow-inner transition-all",
            status === "correct" &&
              "border-emerald-500 bg-emerald-500/10 text-emerald-600",
            status === "revealed" &&
              "border-rose-500 bg-rose-500/10 text-rose-600"
          )}
        />
        {status === "correct" && (
          <CheckCircle2 className="absolute top-1/2 right-4 size-6 -translate-y-1/2 text-emerald-500" />
        )}
        {status === "revealed" && (
          <XCircle className="absolute top-1/2 right-4 size-6 -translate-y-1/2 text-rose-500" />
        )}
      </div>

      {status === "typing" && (
        <Button
          type="submit"
          disabled={!userTyped.trim()}
          className="h-12 w-full rounded-2xl font-bold shadow-md"
        >
          Kiểm tra đáp án (Enter)
        </Button>
      )}
    </form>
  )
}
