"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  PackageOpen,
  Code,
  RotateCcw,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFoldersTree } from "@/hooks/import-export/use-folders-tree"
import { useExportSets } from "@/hooks/import-export/use-export-sets"
import { ImportAnkiTab } from "@/components/import-export/import-anki-tab"
import { ImportCsvTab } from "@/components/import-export/import-csv-tab"
import { ImportTextTab } from "@/components/import-export/import-text-tab"
import { ImportJsonTab } from "@/components/import-export/import-json-tab"
import { BackupRestoreTab } from "@/components/import-export/backup-restore-tab"

export default function ImportExportPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("anki")
  const { flattenedFolders, refreshFolders } = useFoldersTree()
  const { userSets, loadingSets, loadUserSets } = useExportSets()

  const handleImportSuccess = React.useCallback(
    (setId?: string) => {
      refreshFolders()
      loadUserSets()
      if (setId) {
        router.push(`/sets/${setId}`)
      }
    },
    [refreshFolders, loadUserSets, router]
  )

  const handleRestoreSuccess = React.useCallback(() => {
    refreshFolders()
    loadUserSets()
  }, [refreshFolders, loadUserSets])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="from-primary/20 to-primary/5 text-primary flex size-9 items-center justify-center rounded-xl bg-gradient-to-br">
            <UploadCloud className="size-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nhập & Xuất Dữ Liệu
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Nhập bộ thẻ từ Anki (.apkg), CSV/TSV, văn bản Quizlet, JSON hoặc sao
          lưu & khôi phục toàn diện dữ liệu học tập.
        </p>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid h-11 w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="anki" className="gap-2 text-xs font-medium">
            <PackageOpen className="size-4" />
            <span>Anki (.apkg)</span>
          </TabsTrigger>
          <TabsTrigger value="csv" className="gap-2 text-xs font-medium">
            <FileSpreadsheet className="size-4" />
            <span>CSV / TSV</span>
          </TabsTrigger>
          <TabsTrigger value="text" className="gap-2 text-xs font-medium">
            <FileText className="size-4" />
            <span>Văn bản thô</span>
          </TabsTrigger>
          <TabsTrigger value="json" className="gap-2 text-xs font-medium">
            <Code className="size-4" />
            <span>JSON</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-2 text-xs font-medium">
            <RotateCcw className="size-4" />
            <span>Sao lưu & Khôi phục</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anki" className="mt-4">
          <ImportAnkiTab
            folders={flattenedFolders}
            onSuccess={handleImportSuccess}
          />
        </TabsContent>

        <TabsContent value="csv" className="mt-4">
          <ImportCsvTab
            folders={flattenedFolders}
            onSuccess={handleImportSuccess}
          />
        </TabsContent>

        <TabsContent value="text" className="mt-4">
          <ImportTextTab
            folders={flattenedFolders}
            onSuccess={handleImportSuccess}
          />
        </TabsContent>

        <TabsContent value="json" className="mt-4">
          <ImportJsonTab onSuccess={handleImportSuccess} />
        </TabsContent>

        <TabsContent value="backup" className="mt-4">
          <BackupRestoreTab
            userSets={userSets}
            loadingSets={loadingSets}
            onRestoreSuccess={handleRestoreSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
