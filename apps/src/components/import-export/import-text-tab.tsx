"use client"

import * as React from "react"
import { FileText, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { TargetFolderSelect } from "./target-folder-select"
import { useTextImport } from "@/hooks/import-export/use-text-import"
import type { FlattenedFolder } from "@/hooks/import-export/use-folders-tree"

const TERM_SEPARATOR_OPTIONS = [
  { value: "\t", label: "Dấu Tab ( \\t )" },
  { value: " - ", label: "Gạch ngang ( - )" },
  { value: ":", label: "Dấu hai chấm ( : )" },
  { value: ",", label: "Dấu phẩy ( , )" },
]

const CARD_SEPARATOR_OPTIONS = [
  { value: "\n", label: "Xuống dòng ( \\n )" },
  { value: "\n\n", label: "Hai dòng trống ( \\n\\n )" },
  { value: ";", label: "Dấu chấm phẩy ( ; )" },
]

interface ImportTextTabProps {
  folders: FlattenedFolder[]
  onSuccess?: (setId?: string) => void
}

export function ImportTextTab({ folders, onSuccess }: ImportTextTabProps) {
  const {
    content,
    termSeparator,
    cardSeparator,
    setName,
    description,
    folderId,
    tags,
    previewCards,
    importing,
    handleContentChange,
    handleTermSeparatorChange,
    handleCardSeparatorChange,
    setSetName,
    setDescription,
    setFolderId,
    setTags,
    handleImport,
  } = useTextImport({
    onSuccess: (data) => onSuccess?.(data.setId),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="text-primary size-5" />
          Nhập văn bản thô (Quizlet copy-paste)
        </CardTitle>
        <CardDescription>
          Dán danh sách từ vựng sao chép từ Quizlet, Excel hoặc Google Sheets
          dạng &quot;Thuật ngữ [Tab] Định nghĩa&quot;.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <FieldGroup className="gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field className="md:col-span-2">
              <FieldLabel
                htmlFor="text-set-name"
                className="text-xs font-semibold"
              >
                Tên bộ thẻ *
              </FieldLabel>
              <Input
                id="text-set-name"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                placeholder="VD: Từ vựng sao chép từ Quizlet"
              />
            </Field>
            <TargetFolderSelect
              value={folderId}
              onChange={setFolderId}
              folders={folders}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="text-tags" className="text-xs font-semibold">
                Gán nhãn chung
              </FieldLabel>
              <Input
                id="text-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="quizlet, n5"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="text-desc" className="text-xs font-semibold">
                Mô tả (tuỳ chọn)
              </FieldLabel>
              <Input
                id="text-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bộ thẻ nhập từ văn bản..."
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel
                htmlFor="term-sep-select"
                className="text-xs font-semibold"
              >
                Dấu phân cách giữa Từ & Nghĩa
              </FieldLabel>
              <Select
                items={TERM_SEPARATOR_OPTIONS}
                value={termSeparator}
                onValueChange={(val) => val && handleTermSeparatorChange(val)}
              >
                <SelectTrigger id="term-sep-select" className="w-full">
                  <SelectValue placeholder="Dấu phân cách giữa Từ & Nghĩa" />
                </SelectTrigger>
                <SelectContent>
                  {TERM_SEPARATOR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel
                htmlFor="card-sep-select"
                className="text-xs font-semibold"
              >
                Dấu phân cách giữa các thẻ
              </FieldLabel>
              <Select
                items={CARD_SEPARATOR_OPTIONS}
                value={cardSeparator}
                onValueChange={(val) => val && handleCardSeparatorChange(val)}
              >
                <SelectTrigger id="card-sep-select" className="w-full">
                  <SelectValue placeholder="Dấu phân cách giữa các thẻ" />
                </SelectTrigger>
                <SelectContent>
                  {CARD_SEPARATOR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel
                htmlFor="raw-text-content"
                className="text-xs font-semibold"
              >
                Dán danh sách từ vựng vào đây:
              </FieldLabel>
              <span className="text-muted-foreground text-[11px]">
                Hỗ trợ đọc furigana trong ngoặc: 日本語（にほんご）
              </span>
            </div>
            <Textarea
              id="raw-text-content"
              rows={8}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={`犬\tCon chó\n猫\tCon mèo\n本（ほん） - Quyển sách\n車（くるま） - Xe ô tô`}
              className="font-mono text-xs"
            />
          </Field>
        </FieldGroup>

        {/* Text Preview Table */}
        {previewCards.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-muted-foreground text-xs font-semibold">
              Xem trước ({previewCards.length} thẻ được nhận diện):
            </div>
            <div className="border-border overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-12 text-center text-xs">
                      #
                    </TableHead>
                    <TableHead className="text-xs">Từ vựng (Term)</TableHead>
                    <TableHead className="text-xs">
                      Cách đọc (Reading)
                    </TableHead>
                    <TableHead className="text-xs">
                      Định nghĩa (Definition)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewCards.map((c, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-muted-foreground text-center font-mono text-xs">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {c.term}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {c.reading}
                      </TableCell>
                      <TableCell className="text-xs">{c.definition}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
                <span>Đang tạo bộ thẻ...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>Nhập {previewCards.length} thẻ</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
