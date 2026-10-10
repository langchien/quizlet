"use client"

import * as React from "react"
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  Loader2,
} from "lucide-react"
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
import { useCsvImport } from "@/hooks/import-export/use-csv-import"
import { ImportDropzone } from "./import-dropzone"
import { CsvSettingsFields } from "./csv-settings-fields"
import { CsvColumnMapping } from "./csv-column-mapping"
import { CsvPreviewTable } from "./csv-preview-table"
import type { FlattenedFolder } from "@/hooks/import-export/use-folders-tree"

interface ImportCsvTabProps {
  folders: FlattenedFolder[]
  onSuccess?: (setId?: string) => void
}

export function ImportCsvTab({ folders, onSuccess }: ImportCsvTabProps) {
  const {
    file,
    fileInputRef,
    rawContent,
    delimiter,
    hasHeader,
    previewHeaders,
    previewRows,
    columnMapping,
    headerOptions,
    optionalHeaderOptions,
    setName,
    description,
    folderId,
    tags,
    loadingPreview,
    importing,
    canImport,
    openFileDialog,
    handleFileInputChange,
    updateTermIndex,
    updateReadingIndex,
    updateDefinitionIndex,
    updateExampleIndex,
    handleDelimiterChange,
    setHasHeader,
    setSetName,
    setDescription,
    setFolderId,
    setTags,
    handleTextChange,
    handleImport,
  } = useCsvImport({
    onSuccess: (data) => onSuccess?.(data.setId),
  })

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
        <ImportDropzone
          file={file}
          accept=".csv,.tsv,.txt"
          placeholder="Kéo thả file CSV/TSV hoặc nhấp để chọn"
          description="Hỗ trợ định dạng .csv, .tsv"
          icon={UploadCloud}
          fileInputRef={fileInputRef}
          onFileChange={handleFileInputChange}
          onDropzoneClick={openFileDialog}
        />

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
            <CsvSettingsFields
              setName={setName}
              onSetNameChange={setSetName}
              folderId={folderId}
              onFolderIdChange={setFolderId}
              folders={folders}
              tags={tags}
              onTagsChange={setTags}
              description={description}
              onDescriptionChange={setDescription}
              delimiter={delimiter}
              onDelimiterChange={handleDelimiterChange}
              hasHeader={hasHeader}
              onHasHeaderChange={setHasHeader}
            />

            <CsvColumnMapping
              mapping={columnMapping}
              headerOptions={headerOptions}
              optionalHeaderOptions={optionalHeaderOptions}
              onUpdateTerm={updateTermIndex}
              onUpdateReading={updateReadingIndex}
              onUpdateDefinition={updateDefinitionIndex}
              onUpdateExample={updateExampleIndex}
            />

            <CsvPreviewTable headers={previewHeaders} rows={previewRows} />

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
                    <span>Đang nhập dữ liệu...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 data-icon="inline-start" />
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
