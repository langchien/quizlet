"use client"

import * as React from "react"
import { Volume2, Play } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { NativeSelect as Select } from "@/components/ui/native-select"
import { Separator } from "@/components/ui/separator"
import { SrsModeOption } from "@/hooks/settings/use-learning-preferences"
import { VoiceOption } from "@/hooks/useTTS"

export interface SettingsLearningTabProps {
  srsMode: SrsModeOption
  setSrsMode: (mode: SrsModeOption) => void
  dailyGoalCards: number
  setDailyGoalCards: (cards: number) => void
  dailyTimeTarget: number
  setDailyTimeTarget: (time: number) => void
  autoPlayAudio: boolean
  setAutoPlayAudio: (autoPlay: boolean) => void
  ttsRate: number
  setTtsRate: (rate: number) => void
  ttsVoice: string
  setTtsVoice: (voice: string) => void
  voices: VoiceOption[]
  isPlaying: boolean
  handleTestTTS: () => void
}

export function SettingsLearningTab({
  srsMode,
  setSrsMode,
  dailyGoalCards,
  setDailyGoalCards,
  dailyTimeTarget,
  setDailyTimeTarget,
  autoPlayAudio,
  setAutoPlayAudio,
  ttsRate,
  setTtsRate,
  ttsVoice,
  setTtsVoice,
  voices,
  isPlaying,
  handleTestTTS,
}: SettingsLearningTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Cấu hình SRS & Mục tiêu học */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Phương pháp Spaced Repetition (SRS)
          </CardTitle>
          <CardDescription>
            Cấu hình thuật toán tính toán chu kỳ lặp lại thẻ để tối ưu khả năng
            ghi nhớ dài hạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="srsMode">Chế độ SRS mặc định</Label>
            <Select
              id="srsMode"
              value={srsMode}
              onChange={(e) => setSrsMode(e.target.value as SrsModeOption)}
            >
              <option value="auto">
                Tự động thích ứng (Adaptive SM-2 theo tốc độ trả lời - Khuyên
                dùng)
              </option>
              <option value="simple">
                Đơn giản kiểu Quizlet (4 mức: Repeat / Hard / Okay / Easy)
              </option>
              <option value="advanced">
                Nâng cao SM-2 chuẩn (Thuật toán SuperMemo-2 6 cấp độ 0-5)
              </option>
            </Select>
            <p className="text-muted-foreground text-xs">
              {srsMode === "auto" &&
                "Hệ thống tự động đo thời gian phản hồi: trả lời đúng dưới 5s coi là Dễ, trên 15s coi là Khó."}
              {srsMode === "simple" &&
                "Bạn tự chọn mức độ nhớ thẻ: Lặp lại (0 ngày), Khó (1 ngày), Bình thường (3 ngày), Dễ (7 ngày)."}
              {srsMode === "advanced" &&
                "Thuật toán SM-2 đầy đủ tính hệ số Ease Factor và chu kỳ Interval toán học nghiêm ngặt."}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dailyGoalCards">
                Mục tiêu thẻ cần học mỗi ngày
              </Label>
              <Input
                id="dailyGoalCards"
                type="number"
                min="5"
                max="500"
                value={dailyGoalCards}
                onChange={(e) =>
                  setDailyGoalCards(Number(e.target.value) || 20)
                }
              />
              <p className="text-muted-foreground text-[11px]">
                Số lượng thẻ học hoặc ôn tập để duy trì chuỗi Streak.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dailyTimeTarget">
                Mục tiêu thời gian học (phút/ngày)
              </Label>
              <Input
                id="dailyTimeTarget"
                type="number"
                min="5"
                max="180"
                value={dailyTimeTarget}
                onChange={(e) =>
                  setDailyTimeTarget(Number(e.target.value) || 15)
                }
              />
              <p className="text-muted-foreground text-[11px]">
                Thời gian luyện tập hàng ngày hiển thị trên Dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Âm thanh & Phát âm (TTS) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Volume2 className="text-primary size-5" />
            <span>Phát âm & Âm thanh (Text-to-Speech)</span>
          </CardTitle>
          <CardDescription>
            Tùy chỉnh phát âm tiếng Nhật tự động bằng công nghệ Web Speech API.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm font-semibold">
                Tự động phát âm khi xem thẻ
              </Label>
              <p className="text-muted-foreground text-xs">
                Tự động đọc từ tiếng Nhật khi mở hoặc lật sang mặt trước thẻ
                học.
              </p>
            </div>
            <Switch
              checked={autoPlayAudio}
              onCheckedChange={(checked) => setAutoPlayAudio(checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ttsRate">Tốc độ phát âm: {ttsRate}x</Label>
              <Select
                id="ttsRate"
                value={String(ttsRate)}
                onChange={(e) => setTtsRate(Number(e.target.value))}
              >
                <option value="0.75">
                  0.75x (Chậm - phù hợp luyện nghe phát âm chuẩn)
                </option>
                <option value="0.9">0.9x (Chậm vừa phải)</option>
                <option value="1">1.0x (Tốc độ tự nhiên bình thường)</option>
                <option value="1.25">1.25x (Nhanh vừa)</option>
                <option value="1.5">1.5x (Nhanh - tăng phản xạ)</option>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ttsVoice">
                Giọng đọc tiếng Nhật (Voice ja-JP)
              </Label>
              <Select
                id="ttsVoice"
                value={ttsVoice}
                onChange={(e) => setTtsVoice(e.target.value)}
              >
                <option value="">
                  -- Tự động chọn giọng chuẩn của hệ thống --
                </option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="bg-muted/40 border-border/80 flex items-center justify-between rounded-xl border p-3">
            <div className="flex items-center gap-2">
              <Volume2 className="text-primary size-4" />
              <span className="text-foreground text-xs font-medium">
                Câu mẫu: 「こんにちは、日本語の勉強を始めましょう！」
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestTTS}
              disabled={isPlaying}
              className="gap-1.5 text-xs"
            >
              <Play className="size-3.5" />
              <span>{isPlaying ? "Đang đọc..." : "Nghe thử giọng"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
