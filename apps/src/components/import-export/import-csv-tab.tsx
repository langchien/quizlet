"use client"

import * as React from "react"
import {
  FileSpreadsheet,
  UploadCloud,
  Layers,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useCsvImport } from "@/hooks/import-export/use-csv-import"
import type { FlattenedFolder } from "@/hooks/import-export/use-folders-tree"

const DELIMITER_OPTIONS = [
  { value: ",", label: "Dấu phẩy ( , )" },
  { value: "\t", label: "Dấu Tab ( \\t )" },
  { value: ";", label: "Dấu chấm phẩy ( ; )" },
  { value: "|", label: "Dấu gạch đứng ( | )" },
]

interface ImportCsvTabProps {
  folders: FlattenedFolder[]
  onSuccess?: (setId?: string) => void
}

export function ImportCsvTab({ folders, onSuccess }: ImportCsvTabProps) {
  const {
    file,
    rawContent,
    delimiter,
    hasHeader,
    previewHeaders,
    previewRows,
    columnMapping,
    setName,
    description,
    folderId,
    tags,
    loadingPreview,
    importing,
    handleDelimiterChange,
    setHasHeader,
    setColumnMapping,
    setSetName,
    setDescription,
    setFolderId,
    setTags,
    handleFileChange,
    handleTextChange,
    handleImport,
  } = useCsvImport({
    onSuccess: (data) => onSuccess?.(data.setId),
  })

  const headerOptions = React.useMemo(
    () =>
      previewHeaders.map((h, idx) => ({
        value: String(idx),
        label: `Cột ${idx + 1}: ${h}`,
      })),
    [previewHeaders]
  )

  const optionalHeaderOptions = React.useMemo(
    () => [{ value: "-1", label: "-- Không có --" }, ...headerOptions],
    [headerOptions]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileSpreadsheet className="text-primary size-5" />
          Nhập từ file CSV / TSV
        </CardTitle>
        <CardDescription>
          Tải lên file bảng tính hoặc dán dữ liệu CSV, tự động nhận diện dấu
          phân cách và ánh xạ các cột.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Dropzone */}
        <div
          className="border-border/80 hover:border-primary/50 hover:bg-primary/5 group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all"
          onClick={() => document.getElementById("csv-file-input")?.click()}
        >
          <input
            id="csv-file-input"
            type="file"
            accept=".csv,.tsv,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFileChange(f)
            }}
          />
          <div className="from-primary/10 to-primary/5 text-primary mb-2 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110">
            <UploadCloud className="size-5" />
          </div>
          <div className="text-sm font-semibold">
            {file ? file.name : "Kéo thả file CSV/TSV hoặc nhấp để chọn"}
          </div>
          <div className="text-muted-foreground mt-0.5 text-xs">
            {file
              ? `Dung lượng: ${(file.size / 1024).toFixed(1)} KB`
              : "Hỗ trợ định dạng .csv, .tsv"}
          </div>
        </div>

        {/* Or paste content directly */}
        <Field>
          <FieldLabel
            htmlFor="raw-csv-content"
            className="text-xs font-semibold"
          >
            Hoặc dán nội dung CSV/TSV vào đây:
          </FieldLabel>
          <Textarea
            id="raw-csv-content"
            rows={4}
            value={rawContent}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={`Term,Reading,Definition,Example\n食べる,たべる,Ăn,ご飯を食べる\n飲む,のむ,Uống,水を飲む`}
            className="font-mono text-xs"
          />
        </Field>

        {loadingPreview && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-4 text-xs">
            <Loader2 className="text-primary size-4 animate-spin" />
            <span>Đang phân tích cấu trúc CSV...</span>
          </div>
        )}

        {/* CSV Settings & Column Mapping */}
        {previewHeaders.length > 0 && (
          <div className="flex flex-col gap-6 pt-2">
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field className="md:col-span-2">
                  <FieldLabel
                    htmlFor="csv-set-name"
                    className="text-xs font-semibold"
                  >
                    Tên bộ thẻ *
                  </FieldLabel>
                  <Input
                    id="csv-set-name"
                    value={setName}
                    onChange={(e) => setSetName(e.target.value)}
                    placeholder="VD: Từ vựng N4 CSV"
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
                  <FieldLabel
                    htmlFor="csv-tags"
                    className="text-xs font-semibold"
                  >
                    Gán nhãn chung
                  </FieldLabel>
                  <Input
                    id="csv-tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="n4, từ vựng"
                  />
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor="csv-desc"
                    className="text-xs font-semibold"
                  >
                    Mô tả (tuỳ chọn)
                  </FieldLabel>
                  <Input
                    id="csv-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Bộ thẻ tạo từ CSV..."
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end">
                <Field>
                  <FieldLabel
                    htmlFor="csv-delimiter"
                    className="text-xs font-semibold"
                  >
                    Dấu phân cách (Delimiter)
                  </FieldLabel>
                  <Select
                    items={DELIMITER_OPTIONS}
                    value={delimiter}
                    onValueChange={(val) => val && handleDelimiterChange(val)}
                  >
                    <SelectTrigger id="csv-delimiter" className="w-full">
                      <SelectValue placeholder="Chọn dấu phân cách" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIMITER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="flex items-center gap-2 pb-2">
                  <Checkbox
                    id="csv-header-check"
                    checked={hasHeader}
                    onCheckedChange={(checked) => setHasHeader(!!checked)}
                  />
                  <FieldLabel
                    htmlFor="csv-header-check"
                    className="cursor-pointer text-xs font-medium select-none"
                  >
                    Dòng đầu tiên là tiêu đề (Header)
                  </FieldLabel>
                </div>
              </div>
            </FieldGroup>

            {/* Column mapping selectors */}
            <div className="border-border/60 bg-muted/30 flex flex-col gap-3 rounded-2xl border p-4">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                <Layers className="text-primary size-3.5" />
                Ánh xạ các cột CSV
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <Field>
                  <FieldLabel
                    htmlFor="col-term"
                    className="text-foreground text-[11px] font-medium"
                  >
                    Từ vựng (Term) *
                  </FieldLabel>
                  <Select
                    items={headerOptions}
                    value={String(columnMapping.termIndex)}
                    onValueChange={(val) =>
                      val &&
                      setColumnMapping((prev) => ({
                        ...prev,
                        termIndex: Number(val),
                      }))
                    }
                  >
                    <SelectTrigger id="col-term" className="w-full">
                      <SelectValue placeholder="Chọn cột từ vựng" />
                    </SelectTrigger>
                    <SelectContent>
                      {headerOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="col-reading"
                    className="text-foreground text-[11px] font-medium"
                  >
                    Cách đọc (Reading)
                  </FieldLabel>
                  <Select
                    items={optionalHeaderOptions}
                    value={
                      columnMapping.readingIndex !== undefined &&
                      columnMapping.readingIndex !== null
                        ? String(columnMapping.readingIndex)
                        : "-1"
                    }
                    onValueChange={(val) =>
                      setColumnMapping((prev) => ({
                        ...prev,
                        readingIndex:
                          val && Number(val) >= 0 ? Number(val) : undefined,
                      }))
                    }
                  >
                    <SelectTrigger id="col-reading" className="w-full">
                      <SelectValue placeholder="-- Không chọn (dùng Term) --" />
                    </SelectTrigger>
                    <SelectContent>
                      {optionalHeaderOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="col-def"
                    className="text-foreground text-[11px] font-medium"
                  >
                    Định nghĩa (Definition) *
                  </FieldLabel>
                  <Select
                    items={headerOptions}
                    value={String(columnMapping.definitionIndex)}
                    onValueChange={(val) =>
                      val &&
                      setColumnMapping((prev) => ({
                        ...prev,
                        definitionIndex: Number(val),
                      }))
                    }
                  >
                    <SelectTrigger id="col-def" className="w-full">
                      <SelectValue placeholder="Chọn cột định nghĩa" />
                    </SelectTrigger>
                    <SelectContent>
                      {headerOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="col-example"
                    className="text-foreground text-[11px] font-medium"
                  >
                    Ví dụ (Example)
                  </FieldLabel>
                  <Select
                    items={optionalHeaderOptions}
                    value={
                      columnMapping.exampleIndex !== undefined &&
                      columnMapping.exampleIndex !== null
                        ? String(columnMapping.exampleIndex)
                        : "-1"
                    }
                    onValueChange={(val) =>
                      setColumnMapping((prev) => ({
                        ...prev,
                        exampleIndex:
                          val && Number(val) >= 0 ? Number(val) : undefined,
                      }))
                    }
                  >
                    <SelectTrigger id="col-example" className="w-full">
                      <SelectValue placeholder="-- Không có --" />
                    </SelectTrigger>
                    <SelectContent>
                      {optionalHeaderOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Preview Table */}
            {previewRows.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="text-muted-foreground text-xs font-semibold">
                  Bảng xem trước dữ liệu (Mẫu {previewRows.length} dòng):
                </div>
                <div className="border-border overflow-x-auto rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="w-12 text-center text-xs">
                          #
                        </TableHead>
                        {previewHeaders.map((h, i) => (
                          <TableHead key={i} className="text-xs font-semibold">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((row, rIdx) => (
                        <TableRow key={rIdx}>
                          <TableCell className="text-muted-foreground text-center font-mono text-xs">
                            {rIdx + 1}
                          </TableCell>
                          {row.map((cell, cIdx) => (
                            <TableCell
                              key={cIdx}
                              className="max-w-xs truncate text-xs"
                            >
                              {cell || "—"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleImport}
                disabled={importing}
                className="gap-2 rounded-xl px-6"
              >
                {importing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Đang nhập dữ liệu...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Xác nhận nhập CSV</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
