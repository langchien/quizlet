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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { VoiceOption } from "@/hooks/useTTS"

export interface SettingsTtsCardProps {
  autoPlayAudio: boolean
  setAutoPlayAudio: (autoPlay: boolean) => void
  ttsRate: number
  setTtsRate: (rate: number) => void
  ttsVoice: string
  setTtsVoice: (voice: string) => void
  voices: VoiceOption[]
  isPlaying: boolean
  onTestTTS: () => void
}

const TTS_RATE_OPTIONS = [
  { value: "0.75", label: "0.75x (Chậm - phù hợp luyện nghe phát âm chuẩn)" },
  { value: "0.9", label: "0.9x (Chậm vừa phải)" },
  { value: "1", label: "1.0x (Tốc độ tự nhiên bình thường)" },
  { value: "1.25", label: "1.25x (Nhanh vừa)" },
  { value: "1.5", label: "1.5x (Nhanh - tăng phản xạ)" },
]

export function SettingsTtsCard({
  autoPlayAudio,
  setAutoPlayAudio,
  ttsRate,
  setTtsRate,
  ttsVoice,
  setTtsVoice,
  voices,
  isPlaying,
  onTestTTS,
}: SettingsTtsCardProps) {
  const voiceOptions = React.useMemo(
    () => [
      {
        value: "default",
        label: "-- Tự động chọn giọng chuẩn của hệ thống --",
      },
      ...voices.map((v) => ({
        value: v.voiceURI,
        label: `${v.name} (${v.lang})`,
      })),
    ],
    [voices]
  )

  return (
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
            <span className="text-foreground text-sm font-semibold">
              Tự động phát âm khi xem thẻ
            </span>
            <p className="text-muted-foreground text-xs">
              Tự động đọc từ tiếng Nhật khi mở hoặc lật sang mặt trước thẻ học.
            </p>
          </div>
          <Switch
            checked={autoPlayAudio}
            onCheckedChange={setAutoPlayAudio}
            aria-label="Tự động phát âm khi xem thẻ"
          />
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="ttsRate" className="text-xs font-semibold">
              Tốc độ phát âm: {ttsRate}x
            </FieldLabel>
            <Select
              items={TTS_RATE_OPTIONS}
              value={String(ttsRate)}
              onValueChange={(val) => val && setTtsRate(Number(val))}
            >
              <SelectTrigger id="ttsRate" className="w-full">
                <SelectValue placeholder="Chọn tốc độ phát âm" />
              </SelectTrigger>
              <SelectContent>
                {TTS_RATE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="ttsVoice" className="text-xs font-semibold">
              Giọng đọc tiếng Nhật (Voice ja-JP)
            </FieldLabel>
            <Select
              items={voiceOptions}
              value={ttsVoice || "default"}
              onValueChange={(val) =>
                setTtsVoice(val === "default" ? "" : (val ?? ""))
              }
            >
              <SelectTrigger id="ttsVoice" className="w-full">
                <SelectValue placeholder="-- Tự động chọn giọng chuẩn của hệ thống --" />
              </SelectTrigger>
              <SelectContent>
                {voiceOptions.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
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
            onClick={onTestTTS}
            disabled={isPlaying}
            className="gap-1.5 text-xs"
          >
            <Play className="size-3.5" />
            <span>{isPlaying ? "Đang đọc..." : "Nghe thử giọng"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
