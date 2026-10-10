"use client"

import * as React from "react"
import { FileText, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTextImport } from "@/hooks/import-export/use-text-import"
import { TextSettingsFields } from "./text-settings-fields"
import { TextPreviewTable } from "./text-preview-table"
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
    canImport,
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
        <TextSettingsFields
          setName={setName}
          onSetNameChange={setSetName}
          folderId={folderId}
          onFolderIdChange={setFolderId}
          folders={folders}
          tags={tags}
          onTagsChange={setTags}
          description={description}
          onDescriptionChange={setDescription}
          termSeparator={termSeparator}
          onTermSeparatorChange={handleTermSeparatorChange}
          cardSeparator={cardSeparator}
          onCardSeparatorChange={handleCardSeparatorChange}
          content={content}
          onContentChange={handleContentChange}
        />

        <TextPreviewTable cards={previewCards} />

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleImport}
            disabled={importing || !canImport}
            className="px-6"
          >
            {importing ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                <span>Đang tạo bộ thẻ...</span>
              </>
            ) : (
              <>
                <CheckCircle2 data-icon="inline-start" />
                <span>Nhập {previewCards.length} thẻ</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
