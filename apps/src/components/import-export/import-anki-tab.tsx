"use client"

import * as React from "react"
import {
  PackageOpen,
  UploadCloud,
  Layers,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useAnkiImport } from "@/hooks/import-export/use-anki-import"
import type { FlattenedFolder } from "@/hooks/import-export/use-folders-tree"

interface ImportAnkiTabProps {
  folders: FlattenedFolder[]
  onSuccess?: (setId?: string) => void
}

export function ImportAnkiTab({ folders, onSuccess }: ImportAnkiTabProps) {
  const {
    file,
    loadingPreview,
    decks,
    selectedDeckId,
    selectedDeck,
    fieldMapping,
    setName,
    description,
    folderId,
    tags,
    importing,
    setFieldMapping,
    setSetName,
    setDescription,
    setFolderId,
    setTags,
    handleFileChange,
    handleSelectDeck,
    handleImport,
  } = useAnkiImport({
    onSuccess: (data) => onSuccess?.(data.setId),
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <PackageOpen className="text-primary size-5" />
              Nhập bộ thẻ từ Anki (.apkg)
            </CardTitle>
            <CardDescription>
              Hỗ trợ trích xuất tự động SQLite, âm thanh, hình ảnh và phân tích
              các trường của Anki Deck.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">
            ⭐ Ưu tiên cao nhất
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Dropzone */}
        <div
          className="border-border/80 hover:border-primary/50 hover:bg-primary/5 group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all"
          onClick={() => document.getElementById("anki-file-input")?.click()}
        >
          <input
            id="anki-file-input"
            type="file"
            accept=".apkg,.zip"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFileChange(f)
            }}
          />
          <div className="from-primary/10 to-primary/5 text-primary mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform group-hover:scale-110">
            <UploadCloud className="size-6" />
          </div>
          <div className="text-sm font-semibold">
            {file
              ? file.name
              : "Kéo thả file .apkg vào đây hoặc nhấp để chọn file"}
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            {file
              ? `Dung lượng: ${(file.size / 1024 / 1024).toFixed(2)} MB`
              : "Hỗ trợ file xuất Anki Deck (.apkg) từ Anki hoặc extension Quizlet to Anki"}
          </div>
        </div>

        {loadingPreview && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
            <Loader2 className="text-primary size-4 animate-spin" />
            <span>Đang giải nén và phân tích cấu trúc Anki database...</span>
          </div>
        )}

        {/* Preview & Configuration */}
        {selectedDeck && !loadingPreview && (
          <div className="flex flex-col gap-6 pt-2">
            {/* Deck Selection if multiple */}
            {decks.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">
                  Chọn Deck trong file:
                </label>
                <Select
                  value={selectedDeckId}
                  onChange={(e) => handleSelectDeck(e.target.value)}
                  className="w-full"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.name} ({d.cardCount} thẻ)
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Set Configuration */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold">
                  Tên bộ thẻ mới *
                </label>
                <Input
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                  placeholder="VD: Từ vựng Minna Bài 1"
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
                <label className="text-xs font-semibold">
                  Gán nhãn (cách nhau bởi dấu phẩy)
                </label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="anki, n5, bài 1"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">
                  Mô tả (tuỳ chọn)
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bộ thẻ nhập từ Anki..."
                />
              </div>
            </div>

            {/* Field Mapping */}
            <div className="border-border/60 bg-muted/30 flex flex-col gap-3 rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                  <Layers className="text-primary size-3.5" />
                  Ánh xạ trường dữ liệu (Field Mapping)
                </div>
                <Badge variant="secondary" className="text-[11px]">
                  Model: {selectedDeck.modelName}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <label className="text-foreground text-[11px] font-medium">
                    Từ vựng / Thuật ngữ (Term) *
                  </label>
                  <Select
                    value={fieldMapping.term || ""}
                    onChange={(e) =>
                      setFieldMapping((prev) => ({
                        ...prev,
                        term: e.target.value,
                      }))
                    }
                    className="w-full"
                  >
                    <option value="">-- Chọn trường --</option>
                    {selectedDeck.fields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-foreground text-[11px] font-medium">
                    Cách đọc / Furigana (Reading)
                  </label>
                  <Select
                    value={fieldMapping.reading || ""}
                    onChange={(e) =>
                      setFieldMapping((prev) => ({
                        ...prev,
                        reading: e.target.value,
                      }))
                    }
                    className="w-full"
                  >
                    <option value="">-- Không chọn (dùng Term) --</option>
                    {selectedDeck.fields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-foreground text-[11px] font-medium">
                    Định nghĩa / Nghĩa (Definition) *
                  </label>
                  <Select
                    value={fieldMapping.definition || ""}
                    onChange={(e) =>
                      setFieldMapping((prev) => ({
                        ...prev,
                        definition: e.target.value,
                      }))
                    }
                    className="w-full"
                  >
                    <option value="">-- Chọn trường --</option>
                    {selectedDeck.fields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-foreground text-[11px] font-medium">
                    Câu ví dụ (Example)
                  </label>
                  <Select
                    value={fieldMapping.example || ""}
                    onChange={(e) =>
                      setFieldMapping((prev) => ({
                        ...prev,
                        example: e.target.value,
                      }))
                    }
                    className="w-full"
                  >
                    <option value="">-- Không có --</option>
                    {selectedDeck.fields.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Sample Cards Preview Table */}
            {selectedDeck.sampleCards &&
              selectedDeck.sampleCards.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="text-muted-foreground text-xs font-semibold">
                    Xem trước dữ liệu mẫu ({selectedDeck.sampleCards.length} thẻ
                    đầu tiên):
                  </div>
                  <div className="border-border overflow-hidden rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-12 text-center text-xs">
                            #
                          </TableHead>
                          <TableHead className="text-xs">
                            Thuật ngữ (Term)
                          </TableHead>
                          <TableHead className="text-xs">
                            Cách đọc (Reading)
                          </TableHead>
                          <TableHead className="text-xs">
                            Định nghĩa (Definition)
                          </TableHead>
                          <TableHead className="text-xs">
                            Ví dụ (Example)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedDeck.sampleCards.map((sc, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-muted-foreground text-center font-mono text-xs">
                              {i + 1}
                            </TableCell>
                            <TableCell className="text-xs font-semibold">
                              {sc.rawFields[fieldMapping.term || ""] || sc.term}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {sc.rawFields[fieldMapping.reading || ""] ||
                                sc.reading ||
                                "—"}
                            </TableCell>
                            <TableCell className="text-xs">
                              {sc.rawFields[fieldMapping.definition || ""] ||
                                sc.definition}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-xs truncate text-xs">
                              {sc.rawFields[fieldMapping.example || ""] || "—"}
                            </TableCell>
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
                    <span>Đang nhập {selectedDeck.cardCount} thẻ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Hoàn tất nhập ({selectedDeck.cardCount} thẻ)</span>
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
