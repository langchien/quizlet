"use client"

import * as React from "react"
import { Code, FileJson, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useJsonImport } from "@/hooks/import-export/use-json-import"

interface ImportJsonTabProps {
  onSuccess?: (setId?: string) => void
}

export function ImportJsonTab({ onSuccess }: ImportJsonTabProps) {
  const {
    file,
    content,
    parsedSets,
    importing,
    handleFileChange,
    handleContentChange,
    handleImport,
  } = useJsonImport({
    onSuccess: (data) => onSuccess?.(data.setId),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Code className="text-primary size-5" />
          Nhập từ file JSON NihoMemo
        </CardTitle>
        <CardDescription>
          Nhập một hoặc nhiều bộ thẻ từ định dạng JSON chuẩn của hệ thống
          NihoMemo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Dropzone */}
        <div
          className="border-border/80 hover:border-primary/50 hover:bg-primary/5 group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all"
          onClick={() => document.getElementById("json-file-input")?.click()}
        >
          <input
            id="json-file-input"
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFileChange(f)
            }}
          />
          <div className="from-primary/10 to-primary/5 text-primary mb-2 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110">
            <FileJson className="size-5" />
          </div>
          <div className="text-sm font-semibold">
            {file ? file.name : "Kéo thả file JSON hoặc nhấp để chọn"}
          </div>
          <div className="text-muted-foreground mt-0.5 text-xs">
            {file
              ? `Dung lượng: ${(file.size / 1024).toFixed(1)} KB`
              : "Định dạng JSON chuẩn NihoMemo"}
          </div>
        </div>

        {/* JSON Textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold">
            Hoặc dán nội dung JSON vào đây:
          </label>
          <Textarea
            rows={8}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`{\n  "setName": "Minna no Nihongo Bài 1",\n  "cards": [\n    {\n      "term": "私",\n      "reading": "わたし",\n      "definition": "Tôi"\n    }\n  ]\n}`}
            className="font-mono text-xs"
          />
        </div>

        {parsedSets && parsedSets.length > 0 && (
          <div className="border-border/60 bg-muted/30 flex flex-col gap-2 rounded-xl border p-4">
            <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="size-4 text-emerald-500" />
              Đã nhận diện hợp lệ {parsedSets.length} bộ thẻ:
            </div>
            <ul className="text-muted-foreground flex list-inside list-disc flex-col gap-1 text-xs">
              {parsedSets.map((s, idx) => (
                <li key={idx}>
                  <span className="text-foreground font-semibold">
                    {s.setName || s.name || `Bộ thẻ ${idx + 1}`}
                  </span>{" "}
                  — {s.cards?.length || 0} thẻ
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleImport}
            disabled={importing || !content.trim()}
            className="gap-2 rounded-xl px-6"
          >
            {importing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Đang nhập JSON...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>Hoàn tất nhập JSON</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
