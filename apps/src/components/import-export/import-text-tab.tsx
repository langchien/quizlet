"use client"

import * as React from "react"
import { FileText, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect as Select } from "@/components/ui/native-select"
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
import { TargetFolderSelect } from "./target-folder-select"
import { useTextImport } from "@/hooks/import-export/use-text-import"
import type { FlattenedFolder } from "@/hooks/import-export/use-folders-tree"

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold">Tên bộ thẻ *</label>
            <Input
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              placeholder="VD: Từ vựng sao chép từ Quizlet"
            />
          </div>
          <TargetFolderSelect
            value={folderId}
            onChange={setFolderId}
            folders={folders}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Gán nhãn chung</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="quizlet, n5"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Mô tả (tuỳ chọn)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bộ thẻ nhập từ văn bản..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">
              Dấu phân cách giữa Từ & Nghĩa
            </label>
            <Select
              value={termSeparator}
              onChange={(e) => handleTermSeparatorChange(e.target.value)}
              className="w-full"
            >
              <option value="	">Dấu Tab ( \t )</option>
              <option value=" - ">Gạch ngang ( - )</option>
              <option value=":">Dấu hai chấm ( : )</option>
              <option value=",">Dấu phẩy ( , )</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">
              Dấu phân cách giữa các thẻ
            </label>
            <Select
              value={cardSeparator}
              onChange={(e) => handleCardSeparatorChange(e.target.value)}
              className="w-full"
            >
              <option
                value="&#10;"
              >
                Xuống dòng ( \n )
              </option>
              <option
                value="&#10;&#10;"
              >
                Hai dòng trống ( \n\n )
              </option>
              <option value=";">Dấu chấm phẩy ( ; )</option>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold">
              Dán danh sách từ vựng vào đây:
            </label>
            <span className="text-muted-foreground text-[11px]">
              Hỗ trợ đọc furigana trong ngoặc: 日本語（にほんご）
            </span>
          </div>
          <Textarea
            rows={8}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`犬	Con chó\n猫	Con mèo\n本（ほん） - Quyển sách\n車（くるま） - Xe ô tô`}
            className="font-mono text-xs"
          />
        </div>

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
