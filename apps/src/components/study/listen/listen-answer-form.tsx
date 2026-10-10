"use client"

import * as React from "react"
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ListenCardItem, ListenStatus } from "@/types/listen"
import { ListenHintAlert } from "./listen-hint-alert"

interface ListenAnswerFormProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  userTyped: string
  onUserTypedChange: (val: string) => void
  status: ListenStatus
  failedAttempts: number
  currentCard: ListenCardItem
  onCheckAnswer: () => void
  onGiveUp: () => void
  onNextCard: () => void
}

export function ListenAnswerForm({
  inputRef,
  userTyped,
  onUserTypedChange,
  status,
  failedAttempts,
  currentCard,
  onCheckAnswer,
  onGiveUp,
  onNextCard,
}: ListenAnswerFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (status === "listening") {
      onCheckAnswer()
    } else {
      onNextCard()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {status === "listening" && (
        <ListenHintAlert
          failedAttempts={failedAttempts}
          currentCard={currentCard}
        />
      )}

      {/* Form nhập đáp án */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-md flex-col gap-4"
      >
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder="Gõ từ tiếng Nhật nghe được..."
            value={userTyped}
            onChange={(e) => onUserTypedChange(e.target.value)}
            disabled={status !== "listening"}
            autoFocus
            className={cn(
              "font-japanese h-14 rounded-2xl pr-12 text-center text-xl font-bold shadow-inner transition-all",
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

        {status === "listening" && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onGiveUp}
              className="text-muted-foreground h-12 rounded-2xl px-4 text-xs font-semibold"
            >
              <HelpCircle className="mr-1 size-4" />
              <span>Bỏ qua</span>
            </Button>

            <Button
              type="submit"
              disabled={!userTyped.trim()}
              className="h-12 flex-1 rounded-2xl bg-cyan-600 font-bold text-white shadow-md hover:bg-cyan-700"
            >
              Kiểm tra (Enter)
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
