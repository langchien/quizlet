"use client"

import * as React from "react"
import { Code, FileJson, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useJsonImport } from "@/hooks/import-export/use-json-import"
import { ImportDropzone } from "./import-dropzone"
import { JsonSetsSummary } from "./json-sets-summary"

interface ImportJsonTabProps {
  onSuccess?: (setId?: string) => void
}

export function ImportJsonTab({ onSuccess }: ImportJsonTabProps) {
  const {
    file,
    fileInputRef,
    content,
    parsedSets,
    importing,
    canImport,
    openFileDialog,
    handleFileInputChange,
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
        <ImportDropzone
          file={file}
          accept=".json"
          placeholder="Kéo thả file JSON hoặc nhấp để chọn"
          description="Định dạng JSON chuẩn NihoMemo"
          icon={FileJson}
          fileInputRef={fileInputRef}
          onFileChange={handleFileInputChange}
          onDropzoneClick={openFileDialog}
        />

        {/* JSON Textarea */}
        <Field>
          <FieldLabel
            htmlFor="json-raw-content"
            className="text-xs font-semibold"
          >
            Hoặc dán nội dung JSON vào đây:
          </FieldLabel>
          <Textarea
            id="json-raw-content"
            rows={8}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`{\n  "setName": "Minna no Nihongo Bài 1",\n  "cards": [\n    {\n      "term": "私",\n      "reading": "わたし",\n      "definition": "Tôi"\n    }\n  ]\n}`}
            className="font-mono text-xs"
          />
        </Field>

        {parsedSets && <JsonSetsSummary sets={parsedSets} />}

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleImport}
            disabled={importing || !canImport}
            className="px-6"
          >
            {importing ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                <span>Đang nhập JSON...</span>
              </>
            ) : (
              <>
                <CheckCircle2 data-icon="inline-start" />
                <span>Hoàn tất nhập JSON</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
