"use client"

import * as React from "react"
import Link from "next/link"
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TestReviewList } from "./test-review-list"
import type { TestQuestion } from "@/hooks/study/use-test-engine"

interface TestResultViewProps {
  setId: string
  score: number
  correctCount: number
  incorrectCount: number
  totalDuration: number
  questions: TestQuestion[]
  onRestartTest: () => void
}

export function TestResultView({
  setId,
  score,
  correctCount,
  incorrectCount,
  totalDuration,
  questions,
  onRestartTest,
}: TestResultViewProps) {
  const formatResultTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    if (m === 0) return `${s} giây`
    return `${m} phút ${s} giây`
  }

  const getRank = () => {
    if (score === 100)
      return {
        title: "Tuyệt đỉnh! 🌟",
        desc: "Bạn đã trả lời chính xác 100% câu hỏi!",
        badge: "bg-amber-500/20 text-amber-500",
      }
    if (score >= 80)
      return {
        title: "Xuất sắc! 🎉",
        desc: "Kiến thức của bạn rất vững vàng!",
        badge: "bg-emerald-500/20 text-emerald-500",
      }
    if (score >= 50)
      return {
        title: "Đạt yêu cầu! 👍",
        desc: "Hãy ôn lại các câu đã làm sai để tiến bộ hơn nhé.",
        badge: "bg-blue-500/20 text-blue-500",
      }
    return {
      title: "Cần cố gắng thêm! 💪",
      desc: "Đừng nản lòng, hãy luyện tập thêm để ghi nhớ tốt hơn!",
      badge: "bg-rose-500/20 text-rose-500",
    }
  }

  const rank = getRank()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-20">
      {/* Result Hero Card */}
      <div className="border-border bg-card overflow-hidden rounded-3xl border p-6 text-center shadow-xl sm:p-8">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-lg">
          <Award className="size-8" />
        </div>

        <span
          className={cn(
            "inline-block rounded-full px-3 py-1 text-xs font-bold",
            rank.badge
          )}
        >
          {rank.title}
        </span>

        <h1 className="text-foreground mt-2 text-3xl font-black sm:text-4xl">
          Kết quả bài kiểm tra
        </h1>
        <p className="text-muted-foreground mt-1 text-xs font-medium">
          {rank.desc}
        </p>

        {/* Big Metric Box */}
        <div className="border-border/60 from-muted/30 to-background my-6 rounded-2xl border bg-gradient-to-b p-6">
          <div className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
            Điểm số đạt được
          </div>
          <div className="text-foreground mt-1 text-5xl font-black sm:text-6xl">
            {score}
            <span className="text-3xl text-purple-600 sm:text-4xl">%</span>
          </div>

          <div className="border-border/60 mt-6 grid grid-cols-3 gap-2 border-t pt-4">
            <div className="text-center">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Số câu đúng</span>
              </div>
              <div className="mt-0.5 text-lg font-bold text-emerald-500">
                {correctCount} / {questions.length}
              </div>
            </div>

            <div className="text-center">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <XCircle className="size-3.5 text-rose-500" />
                <span>Số câu sai</span>
              </div>
              <div className="mt-0.5 text-lg font-bold text-rose-500">
                {incorrectCount}
              </div>
            </div>

            <div className="text-center">
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
                <Clock className="size-3.5 text-blue-500" />
                <span>Thời gian làm</span>
              </div>
              <div className="text-foreground mt-0.5 text-lg font-bold">
                {formatResultTime(totalDuration)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={onRestartTest}
            className="gap-2 rounded-xl bg-purple-600 font-bold text-white shadow-xs hover:bg-purple-700"
          >
            <RotateCcw className="size-4" />
            <span>Làm lại bài kiểm tra</span>
          </Button>

          <Link
            href={`/sets/${setId}`}
            className="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
          >
            <BookOpen className="size-4" />
            <span>Về bộ thẻ</span>
          </Link>
        </div>
      </div>

      {/* Chi tiết từng câu hỏi đúng/sai */}
      <TestReviewList questions={questions} />
    </div>
  )
}
