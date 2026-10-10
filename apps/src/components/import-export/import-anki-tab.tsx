"use client"

import * as React from "react"
import { PackageOpen, UploadCloud, CheckCircle2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAnkiImport } from "@/hooks/import-export/use-anki-import"
import { ImportDropzone } from "./import-dropzone"
import { AnkiSettingsFields } from "./anki-settings-fields"
import { AnkiFieldMappingComponent } from "./anki-field-mapping"
import { AnkiPreviewTable } from "./anki-preview-table"
import type { FlattenedFolder } from "@/hooks/import-export/use-folders-tree"

interface ImportAnkiTabProps {
  folders: FlattenedFolder[]
  onSuccess?: (setId?: string) => void
}

export function ImportAnkiTab({ folders, onSuccess }: ImportAnkiTabProps) {
  const {
    file,
    fileInputRef,
    loadingPreview,
    decks,
    selectedDeckId,
    selectedDeck,
    deckOptions,
    fieldOptions,
    fieldMapping,
    setName,
    description,
    folderId,
    tags,
    importing,
    canImport,
    openFileDialog,
    handleFileInputChange,
    handleFieldMappingChange,
    setSetName,
    setDescription,
    setFolderId,
    setTags,
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
        <ImportDropzone
          file={file}
          accept=".apkg,.zip"
          placeholder="Kéo thả file .apkg vào đây hoặc nhấp để chọn file"
          description="Hỗ trợ file xuất Anki Deck (.apkg) từ Anki hoặc extension Quizlet to Anki"
          icon={UploadCloud}
          fileInputRef={fileInputRef}
          onFileChange={handleFileInputChange}
          onDropzoneClick={openFileDialog}
          className="p-8"
        />

        {loadingPreview && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
            <Loader2 className="text-primary size-4 animate-spin" />
            <span>Đang giải nén và phân tích cấu trúc Anki database...</span>
          </div>
        )}

        {/* Preview & Configuration */}
        {selectedDeck && !loadingPreview && (
          <div className="flex flex-col gap-6 pt-2">
            <AnkiSettingsFields
              decksCount={decks.length}
              deckOptions={deckOptions}
              selectedDeckId={selectedDeckId}
              onSelectDeck={handleSelectDeck}
              setName={setName}
              onSetNameChange={setSetName}
              folderId={folderId}
              onFolderIdChange={setFolderId}
              folders={folders}
              tags={tags}
              onTagsChange={setTags}
              description={description}
              onDescriptionChange={setDescription}
            />

            <AnkiFieldMappingComponent
              modelName={selectedDeck.modelName}
              fieldMapping={fieldMapping}
              fieldOptions={fieldOptions}
              onFieldMappingChange={handleFieldMappingChange}
            />

            <AnkiPreviewTable
              sampleCards={selectedDeck.sampleCards || []}
              fieldMapping={fieldMapping}
            />

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleImport}
                disabled={importing || !canImport}
                className="px-6"
              >
                {importing ? (
                  <>
                    <Loader2
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                    <span>Đang nhập {selectedDeck.cardCount} thẻ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 data-icon="inline-start" />
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
