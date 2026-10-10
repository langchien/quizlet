"use client"

import * as React from "react"
import Link from "next/link"
import { CheckSquare, ChevronLeft, Trophy, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TestConfigQuestionCount } from "./test-config-question-count"
import { TestConfigQuestionTypes } from "./test-config-question-types"
import { TestConfigTimeLimit } from "./test-config-time-limit"

interface TestConfigViewProps {
  setId: string
  setName: string
  totalCards: number
  questionCount: number
  setQuestionCount: (n: number) => void
  allowMultipleChoice: boolean
  setAllowMultipleChoice: (v: boolean) => void
  allowTrueFalse: boolean
  setAllowTrueFalse: (v: boolean) => void
  allowWritten: boolean
  setAllowWritten: (v: boolean) => void
  timeLimitMinutes: number
  setTimeLimitMinutes: (n: number) => void
  isReverse: boolean
  setIsReverse: (v: boolean) => void
  personalBestScore: number | null
  onStartTest: () => void
}

export function TestConfigView({
  setId,
  setName,
  totalCards,
  questionCount,
  setQuestionCount,
  allowMultipleChoice,
  setAllowMultipleChoice,
  allowTrueFalse,
  setAllowTrueFalse,
  allowWritten,
  setAllowWritten,
  timeLimitMinutes,
  setTimeLimitMinutes,
  isReverse,
  setIsReverse,
  personalBestScore,
  onStartTest,
}: TestConfigViewProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-16">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href={`/sets/${setId}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ChevronLeft className="size-4" />
          <span>Về bộ thẻ</span>
        </Link>
        <Badge variant="outline" className="text-xs font-semibold">
          {setName}
        </Badge>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md">
            <CheckSquare className="size-6" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-extrabold tracking-tight">
              Thiết lập bài kiểm tra
            </h1>
            <p className="text-muted-foreground text-xs">
              Tuỳ chỉnh số lượng câu hỏi, dạng bài thi và thời gian theo ý bạn.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* 1. Số lượng câu hỏi */}
          <TestConfigQuestionCount
            totalCards={totalCards}
            questionCount={questionCount}
            onQuestionCountChange={setQuestionCount}
          />

          {/* 2. Dạng câu hỏi */}
          <TestConfigQuestionTypes
            allowMultipleChoice={allowMultipleChoice}
            onAllowMultipleChoiceChange={setAllowMultipleChoice}
            allowTrueFalse={allowTrueFalse}
            onAllowTrueFalseChange={setAllowTrueFalse}
            allowWritten={allowWritten}
            onAllowWrittenChange={setAllowWritten}
          />

          {/* 3. Giới hạn thời gian */}
          <TestConfigTimeLimit
            timeLimitMinutes={timeLimitMinutes}
            onTimeLimitChange={setTimeLimitMinutes}
          />

          {/* 4. Đảo mặt câu hỏi */}
          <div className="border-border/60 bg-muted/30 flex items-center justify-between rounded-2xl border p-4">
            <div className="flex flex-col gap-0.5">
              <Label
                htmlFor="switch-reverse"
                className="text-foreground cursor-pointer text-sm font-semibold"
              >
                Đảo ngược trắc nghiệm (Reverse)
              </Label>
              <p className="text-muted-foreground text-xs">
                Hiển thị nghĩa tiếng Việt để chọn từ tiếng Nhật cho câu trắc
                nghiệm và đúng/sai.
              </p>
            </div>
            <Switch
              id="switch-reverse"
              checked={isReverse}
              onCheckedChange={setIsReverse}
            />
          </div>

          {/* Kỷ lục cá nhân nếu có */}
          {personalBestScore !== null && (
            <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 p-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Trophy className="size-4 shrink-0" />
              <span>
                Điểm số cao nhất của bạn trong bộ thẻ này:{" "}
                <b>{personalBestScore}%</b>
              </span>
            </div>
          )}

          {/* Start Test Button */}
          <Button
            size="lg"
            onClick={onStartTest}
            className="h-13 w-full gap-2 rounded-2xl bg-purple-600 text-base font-bold text-white shadow-lg hover:bg-purple-700"
          >
            <Play className="size-5 fill-current" />
            <span>Bắt đầu làm bài kiểm tra</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
