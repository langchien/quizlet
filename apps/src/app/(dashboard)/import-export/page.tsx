"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  PackageOpen,
  Code,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileJson,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect as Select } from "@/components/ui/native-select"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type {
  AnkiPreviewDeck,
  AnkiFieldMapping,
  ColumnMapping,
} from "@/schemas/import-export"
import type { FolderNode } from "@/app/api/folders/route"

interface ParsedJsonSet {
  setName?: string
  name?: string
  cards?: Array<Record<string, unknown>>
}

interface RestoreSummaryResult {
  restoredFoldersCount: number
  restoredSetsCount: number
  restoredCardsCount: number
  restoredTagsCount: number
  restoredSessionsCount: number
  restoredStatsCount: number
}

export default function ImportExportPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("anki")
  const [folders, setFolders] = React.useState<FolderNode[]>([])
  const [userSets, setUserSets] = React.useState<
    Array<{ id: string; name: string; cardCount: number }>
  >([])
  const [loadingSets, setLoadingSets] = React.useState(false)

  // ----------------------------------------------------
  // ANKI STATE
  // ----------------------------------------------------
  const [ankiFile, setAnkiFile] = React.useState<File | null>(null)
  const [ankiLoadingPreview, setAnkiLoadingPreview] = React.useState(false)
  const [ankiDecks, setAnkiDecks] = React.useState<AnkiPreviewDeck[]>([])
  const [selectedDeckId, setSelectedDeckId] = React.useState<string>("")
  const [ankiFieldMapping, setAnkiFieldMapping] =
    React.useState<AnkiFieldMapping>({})
  const [ankiSetName, setAnkiSetName] = React.useState("")
  const [ankiDescription, setAnkiDescription] = React.useState("")
  const [ankiFolderId, setAnkiFolderId] = React.useState("")
  const [ankiTags, setAnkiTags] = React.useState("anki")
  const [ankiImporting, setAnkiImporting] = React.useState(false)

  // ----------------------------------------------------
  // CSV / TSV STATE
  // ----------------------------------------------------
  const [csvFile, setCsvFile] = React.useState<File | null>(null)
  const [csvRawContent, setCsvRawContent] = React.useState("")
  const [csvDelimiter, setCsvDelimiter] = React.useState(",")
  const [csvHasHeader, setCsvHasHeader] = React.useState(true)
  const [csvPreviewHeaders, setCsvPreviewHeaders] = React.useState<string[]>([])
  const [csvPreviewRows, setCsvPreviewRows] = React.useState<string[][]>([])
  const [csvColumnMapping, setCsvColumnMapping] = React.useState<ColumnMapping>(
    {
      termIndex: 0,
      definitionIndex: 1,
    }
  )
  const [csvSetName, setCsvSetName] = React.useState("")
  const [csvDescription, setCsvDescription] = React.useState("")
  const [csvFolderId, setCsvFolderId] = React.useState("")
  const [csvTags, setCsvTags] = React.useState("")
  const [csvLoadingPreview, setCsvLoadingPreview] = React.useState(false)
  const [csvImporting, setCsvImporting] = React.useState(false)

  // ----------------------------------------------------
  // TEXT STATE
  // ----------------------------------------------------
  const [textContent, setTextContent] = React.useState("")
  const [termSeparator, setTermSeparator] = React.useState("\t")
  const [cardSeparator, setCardSeparator] = React.useState("\n")
  const [textSetName, setTextSetName] = React.useState("")
  const [textDescription, setTextDescription] = React.useState("")
  const [textFolderId, setTextFolderId] = React.useState("")
  const [textTags, setTextTags] = React.useState("")
  const [textPreviewCards, setTextPreviewCards] = React.useState<
    Array<{ term: string; reading: string; definition: string }>
  >([])
  const [textImporting, setTextImporting] = React.useState(false)

  // ----------------------------------------------------
  // JSON STATE
  // ----------------------------------------------------
  const [jsonFile, setJsonFile] = React.useState<File | null>(null)
  const [jsonContent, setJsonContent] = React.useState("")
  const [jsonParsedSets, setJsonParsedSets] = React.useState<
    ParsedJsonSet[] | null
  >(null)
  const [jsonImporting, setJsonImporting] = React.useState(false)

  // ----------------------------------------------------
  // BACKUP & RESTORE STATE
  // ----------------------------------------------------
  const [restoreFile, setRestoreFile] = React.useState<File | null>(null)
  const [restoreConfirmOpen, setRestoreConfirmOpen] = React.useState(false)
  const [restoring, setRestoring] = React.useState(false)
  const [restoreSummary, setRestoreSummary] =
    React.useState<RestoreSummaryResult | null>(null)

  // Fetch Folders and User Sets
  const loadInitialData = React.useCallback(async () => {
    try {
      setLoadingSets(true)
      const [fRes, sRes] = await Promise.all([
        fetch("/api/folders"),
        fetch("/api/sets?limit=100"),
      ])
      if (fRes.ok) {
        const fData = await fRes.json()
        setFolders(fData)
      }
      if (sRes.ok) {
        const sData = await sRes.json()
        setUserSets(sData.items || [])
      }
    } catch (err) {
      console.error("Error loading folders/sets:", err)
    } finally {
      setLoadingSets(false)
    }
  }, [])

  React.useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const flattenedFolders = React.useMemo(() => {
    const list: Array<{ id: string; name: string }> = []
    const traverse = (nodes: FolderNode[], level = 0) => {
      for (const node of nodes) {
        list.push({
          id: node.id,
          name: `${"　".repeat(level)}📁 ${node.name}`,
        })
        if (node.children && node.children.length > 0) {
          traverse(node.children, level + 1)
        }
      }
    }
    traverse(folders, 0)
    return list
  }, [folders])

  // ====================================================
  // 1. ANKI LOGIC
  // ====================================================
  const handleAnkiFileChange = async (file: File) => {
    setAnkiFile(file)
    setAnkiLoadingPreview(true)
    setAnkiDecks([])

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/import/anki/preview", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Không thể đọc file Anki .apkg")
        return
      }

      const decks: AnkiPreviewDeck[] = data.decks || []
      setAnkiDecks(decks)
      if (decks.length > 0) {
        const firstDeck = decks[0]
        setSelectedDeckId(String(firstDeck.id))
        setAnkiSetName(firstDeck.name)
        setAnkiFieldMapping(firstDeck.suggestedMapping || {})
      }
      toast.success(`Đã đọc thành công ${decks.length} bộ thẻ từ file .apkg!`)
    } catch (err) {
      console.error(err)
      toast.error("Lỗi khi tải và phân tích file Anki.")
    } finally {
      setAnkiLoadingPreview(false)
    }
  }

  const handleSelectAnkiDeck = (deckIdStr: string) => {
    setSelectedDeckId(deckIdStr)
    const deck = ankiDecks.find((d) => String(d.id) === deckIdStr)
    if (deck) {
      setAnkiSetName(deck.name)
      setAnkiFieldMapping(deck.suggestedMapping || {})
    }
  }

  const selectedAnkiDeck = React.useMemo(() => {
    return (
      ankiDecks.find((d) => String(d.id) === selectedDeckId) || ankiDecks[0]
    )
  }, [ankiDecks, selectedDeckId])

  const handleImportAnki = async () => {
    if (!ankiFile) {
      toast.error("Vui lòng chọn file Anki (.apkg)")
      return
    }
    if (!ankiSetName.trim()) {
      toast.error("Vui lòng nhập tên bộ thẻ")
      return
    }

    setAnkiImporting(true)
    const formData = new FormData()
    formData.append("file", ankiFile)
    formData.append("setName", ankiSetName.trim())
    if (ankiDescription.trim())
      formData.append("description", ankiDescription.trim())
    if (ankiFolderId) formData.append("folderId", ankiFolderId)
    if (selectedDeckId) formData.append("deckId", selectedDeckId)
    if (ankiTags.trim()) formData.append("tags", ankiTags.trim())
    formData.append("fieldMapping", JSON.stringify(ankiFieldMapping))

    try {
      const res = await fetch("/api/import/anki", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Nhập bộ thẻ Anki thất bại")
        return
      }

      toast.success(
        `Đã tạo thành công bộ thẻ "${data.setName}" với ${data.cardCount} thẻ!`
      )
      loadInitialData()
      if (data.setId) {
        router.push(`/sets/${data.setId}`)
      }
    } catch (err) {
      console.error(err)
      toast.error("Lỗi máy chủ khi import Anki.")
    } finally {
      setAnkiImporting(false)
    }
  }

  // ====================================================
  // 2. CSV / TSV LOGIC
  // ====================================================
  const handleCsvFileChange = async (file: File) => {
    setCsvFile(file)
    setCsvLoadingPreview(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("delimiter", csvDelimiter)

    try {
      const res = await fetch("/api/import/csv/preview", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Không thể xem trước CSV")
        return
      }

      const prev = data.preview
      setCsvDelimiter(prev.detectedDelimiter || ",")
      setCsvHasHeader(prev.hasHeader)
      setCsvPreviewHeaders(prev.headers || [])
      setCsvPreviewRows(prev.sampleRows || [])
      setCsvColumnMapping(
        prev.suggestedMapping || { termIndex: 0, definitionIndex: 1 }
      )
      setCsvSetName(file.name.replace(/\.[^/.]+$/, ""))
      toast.success(`Đã phân tích ${prev.totalRows} dòng từ CSV!`)
    } catch (err) {
      console.error(err)
      toast.error("Lỗi xem trước file CSV.")
    } finally {
      setCsvLoadingPreview(false)
    }
  }

  const handleCsvTextChange = async (text: string) => {
    setCsvRawContent(text)
    if (!text.trim()) return

    setCsvLoadingPreview(true)
    try {
      const res = await fetch("/api/import/csv/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, delimiter: csvDelimiter }),
      })
      const data = await res.json()
      if (res.ok && data.preview) {
        const prev = data.preview
        setCsvPreviewHeaders(prev.headers || [])
        setCsvPreviewRows(prev.sampleRows || [])
        setCsvColumnMapping(
          prev.suggestedMapping || { termIndex: 0, definitionIndex: 1 }
        )
        if (!csvSetName) setCsvSetName("Bộ thẻ CSV")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCsvLoadingPreview(false)
    }
  }

  const handleImportCsv = async () => {
    if (!csvFile && !csvRawContent.trim()) {
      toast.error("Vui lòng chọn file CSV hoặc dán nội dung")
      return
    }
    if (!csvSetName.trim()) {
      toast.error("Vui lòng nhập tên bộ thẻ")
      return
    }

    setCsvImporting(true)
    try {
      let res: Response
      if (csvFile) {
        const formData = new FormData()
        formData.append("file", csvFile)
        formData.append("setName", csvSetName.trim())
        if (csvDescription.trim())
          formData.append("description", csvDescription.trim())
        if (csvFolderId) formData.append("folderId", csvFolderId)
        formData.append("delimiter", csvDelimiter)
        formData.append("hasHeader", String(csvHasHeader))
        formData.append("columnMapping", JSON.stringify(csvColumnMapping))
        if (csvTags.trim()) formData.append("tags", csvTags.trim())

        res = await fetch("/api/import/csv", {
          method: "POST",
          body: formData,
        })
      } else {
        res = await fetch("/api/import/csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            setName: csvSetName.trim(),
            description: csvDescription.trim() || undefined,
            folderId: csvFolderId || undefined,
            content: csvRawContent,
            delimiter: csvDelimiter,
            hasHeader: csvHasHeader,
            columnMapping: csvColumnMapping,
            tags: csvTags
              .split(/[,;\s]+/)
              .map((t) => t.trim())
              .filter(Boolean),
          }),
        })
      }

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Import CSV thất bại")
        return
      }

      toast.success(
        `Đã tạo bộ thẻ "${data.setName}" với ${data.cardCount} thẻ!`
      )
      loadInitialData()
      if (data.setId) {
        router.push(`/sets/${data.setId}`)
      }
    } catch (err) {
      console.error(err)
      toast.error("Lỗi máy chủ khi import CSV.")
    } finally {
      setCsvImporting(false)
    }
  }

  // ====================================================
  // 3. TEXT LOGIC (Quizlet Copy-paste)
  // ====================================================
  const handleTextChange = async (val: string) => {
    setTextContent(val)
    if (!val.trim()) {
      setTextPreviewCards([])
      return
    }

    try {
      const res = await fetch("/api/import/text/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: val,
          termSeparator,
          cardSeparator,
        }),
      })
      const data = await res.json()
      if (res.ok && data.preview) {
        setTextPreviewCards(data.preview.sampleCards || [])
        if (!textSetName) setTextSetName("Bộ thẻ nhập từ văn bản")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleImportText = async () => {
    if (!textContent.trim()) {
      toast.error("Vui lòng nhập nội dung văn bản")
      return
    }
    if (!textSetName.trim()) {
      toast.error("Vui lòng nhập tên bộ thẻ")
      return
    }

    setTextImporting(true)
    try {
      const res = await fetch("/api/import/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setName: textSetName.trim(),
          description: textDescription.trim() || undefined,
          folderId: textFolderId || undefined,
          content: textContent,
          termDefSeparator: termSeparator,
          cardSeparator,
          tags: textTags
            .split(/[,;\s]+/)
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Nhập văn bản thất bại")
        return
      }

      toast.success(
        `Đã tạo bộ thẻ "${data.setName}" với ${data.cardCount} thẻ!`
      )
      loadInitialData()
      if (data.setId) {
        router.push(`/sets/${data.setId}`)
      }
    } catch (err) {
      console.error(err)
      toast.error("Lỗi máy chủ khi import văn bản.")
    } finally {
      setTextImporting(false)
    }
  }

  // ====================================================
  // 4. JSON LOGIC
  // ====================================================
  const handleJsonFileChange = async (file: File) => {
    setJsonFile(file)
    try {
      const text = await file.text()
      setJsonContent(text)
      const parsed = JSON.parse(text)
      const sets = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.studySets)
          ? parsed.studySets
          : Array.isArray(parsed.sets)
            ? parsed.sets
            : [parsed]
      setJsonParsedSets(sets as ParsedJsonSet[])
      toast.success(`Đã nhận diện ${sets.length} bộ thẻ từ file JSON!`)
    } catch (e) {
      console.error(e)
      toast.error("File JSON không hợp lệ.")
      setJsonParsedSets(null)
    }
  }

  const handleImportJson = async () => {
    if (!jsonContent.trim()) {
      toast.error("Vui lòng chọn file JSON hoặc dán nội dung")
      return
    }

    setJsonImporting(true)
    try {
      let parsed: unknown
      try {
        parsed = JSON.parse(jsonContent)
      } catch {
        toast.error("Nội dung JSON không đúng cú pháp")
        setJsonImporting(false)
        return
      }

      const res = await fetch("/api/import/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Import JSON thất bại")
        return
      }

      toast.success(`Đã import thành công ${data.importedCount || 1} bộ thẻ!`)
      loadInitialData()
      if (data.setId) {
        router.push(`/sets/${data.setId}`)
      }
    } catch (err) {
      console.error(err)
      toast.error("Lỗi máy chủ khi import JSON.")
    } finally {
      setJsonImporting(false)
    }
  }

  // ====================================================
  // 5. RESTORE LOGIC
  // ====================================================
  const handleRestoreSubmit = async () => {
    if (!restoreFile) {
      toast.error("Vui lòng chọn file backup JSON")
      return
    }

    setRestoring(true)
    const formData = new FormData()
    formData.append("file", restoreFile)

    try {
      const res = await fetch("/api/import/restore", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Khôi phục dữ liệu thất bại")
        return
      }

      setRestoreSummary(data.summary)
      setRestoreConfirmOpen(false)
      toast.success("Khôi phục toàn bộ dữ liệu thành công!")
      loadInitialData()
    } catch (err) {
      console.error(err)
      toast.error("Lỗi máy chủ khi phục hồi dữ liệu.")
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div className="space-y-6">
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

        {/* ==================================================== */}
        {/* TAB 1: ANKI (.APKG) */}
        {/* ==================================================== */}
        <TabsContent value="anki" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PackageOpen className="text-primary size-5" />
                    Nhập bộ thẻ từ Anki (.apkg)
                  </CardTitle>
                  <CardDescription>
                    Hỗ trợ trích xuất tự động SQLite, âm thanh, hình ảnh và phân
                    tích các trường của Anki Deck.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  ⭐ Ưu tiên cao nhất
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dropzone */}
              <div
                className="border-border/80 hover:border-primary/50 hover:bg-primary/5 group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all"
                onClick={() =>
                  document.getElementById("anki-file-input")?.click()
                }
              >
                <input
                  id="anki-file-input"
                  type="file"
                  accept=".apkg,.zip"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleAnkiFileChange(f)
                  }}
                />
                <div className="from-primary/10 to-primary/5 text-primary mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform group-hover:scale-110">
                  <UploadCloud className="size-6" />
                </div>
                <div className="text-sm font-semibold">
                  {ankiFile
                    ? ankiFile.name
                    : "Kéo thả file .apkg vào đây hoặc nhấp để chọn file"}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {ankiFile
                    ? `Dung lượng: ${(ankiFile.size / 1024 / 1024).toFixed(2)} MB`
                    : "Hỗ trợ file xuất Anki Deck (.apkg) từ Anki hoặc extension Quizlet to Anki"}
                </div>
              </div>

              {ankiLoadingPreview && (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
                  <Loader2 className="text-primary size-4 animate-spin" />
                  <span>
                    Đang giải nén và phân tích cấu trúc Anki database...
                  </span>
                </div>
              )}

              {/* Preview & Configuration */}
              {selectedAnkiDeck && !ankiLoadingPreview && (
                <div className="space-y-6 pt-2">
                  {/* Deck Selection if multiple */}
                  {ankiDecks.length > 1 && (
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold">
                        Chọn Deck trong file:
                      </label>
                      <Select
                        value={selectedDeckId}
                        onChange={(e) => handleSelectAnkiDeck(e.target.value)}
                      >
                        {ankiDecks.map((d) => (
                          <option key={d.id} value={String(d.id)}>
                            {d.name} ({d.cardCount} thẻ)
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {/* Set Configuration */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold">
                        Tên bộ thẻ mới *
                      </label>
                      <Input
                        value={ankiSetName}
                        onChange={(e) => setAnkiSetName(e.target.value)}
                        placeholder="VD: Từ vựng Minna Bài 1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">
                        Lưu vào thư mục
                      </label>
                      <Select
                        value={ankiFolderId}
                        onChange={(e) => setAnkiFolderId(e.target.value)}
                      >
                        <option value="">Thư mục gốc (Root)</option>
                        {flattenedFolders.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">
                        Gán nhãn (cách nhau bởi dấu phẩy)
                      </label>
                      <Input
                        value={ankiTags}
                        onChange={(e) => setAnkiTags(e.target.value)}
                        placeholder="anki, n5, bài 1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">
                        Mô tả (tuỳ chọn)
                      </label>
                      <Input
                        value={ankiDescription}
                        onChange={(e) => setAnkiDescription(e.target.value)}
                        placeholder="Bộ thẻ nhập từ Anki..."
                      />
                    </div>
                  </div>

                  {/* Field Mapping */}
                  <div className="border-border/60 bg-muted/30 space-y-3 rounded-2xl border p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                        <Layers className="text-primary size-3.5" />
                        Ánh xạ trường dữ liệu (Field Mapping)
                      </div>
                      <Badge variant="secondary" className="text-[11px]">
                        Model: {selectedAnkiDeck.modelName}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                      <div className="space-y-1">
                        <label className="text-foreground text-[11px] font-medium">
                          Từ vựng / Thuật ngữ (Term) *
                        </label>
                        <Select
                          value={ankiFieldMapping.term || ""}
                          onChange={(e) =>
                            setAnkiFieldMapping((prev) => ({
                              ...prev,
                              term: e.target.value,
                            }))
                          }
                        >
                          <option value="">-- Chọn trường --</option>
                          {selectedAnkiDeck.fields.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-foreground text-[11px] font-medium">
                          Cách đọc / Furigana (Reading)
                        </label>
                        <Select
                          value={ankiFieldMapping.reading || ""}
                          onChange={(e) =>
                            setAnkiFieldMapping((prev) => ({
                              ...prev,
                              reading: e.target.value,
                            }))
                          }
                        >
                          <option value="">-- Không chọn (dùng Term) --</option>
                          {selectedAnkiDeck.fields.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-foreground text-[11px] font-medium">
                          Định nghĩa / Nghĩa (Definition) *
                        </label>
                        <Select
                          value={ankiFieldMapping.definition || ""}
                          onChange={(e) =>
                            setAnkiFieldMapping((prev) => ({
                              ...prev,
                              definition: e.target.value,
                            }))
                          }
                        >
                          <option value="">-- Chọn trường --</option>
                          {selectedAnkiDeck.fields.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-foreground text-[11px] font-medium">
                          Câu ví dụ (Example)
                        </label>
                        <Select
                          value={ankiFieldMapping.example || ""}
                          onChange={(e) =>
                            setAnkiFieldMapping((prev) => ({
                              ...prev,
                              example: e.target.value,
                            }))
                          }
                        >
                          <option value="">-- Không có --</option>
                          {selectedAnkiDeck.fields.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Sample Cards Preview Table */}
                  {selectedAnkiDeck.sampleCards &&
                    selectedAnkiDeck.sampleCards.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-muted-foreground text-xs font-semibold">
                          Xem trước dữ liệu mẫu (
                          {selectedAnkiDeck.sampleCards.length} thẻ đầu tiên):
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
                              {selectedAnkiDeck.sampleCards.map((sc, i) => (
                                <TableRow key={i}>
                                  <TableCell className="text-muted-foreground text-center font-mono text-xs">
                                    {i + 1}
                                  </TableCell>
                                  <TableCell className="text-xs font-semibold">
                                    {sc.rawFields[
                                      ankiFieldMapping.term || ""
                                    ] || sc.term}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-xs">
                                    {sc.rawFields[
                                      ankiFieldMapping.reading || ""
                                    ] ||
                                      sc.reading ||
                                      "—"}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {sc.rawFields[
                                      ankiFieldMapping.definition || ""
                                    ] || sc.definition}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground max-w-xs truncate text-xs">
                                    {sc.rawFields[
                                      ankiFieldMapping.example || ""
                                    ] || "—"}
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
                      onClick={handleImportAnki}
                      disabled={ankiImporting}
                      className="gap-2 rounded-xl px-6"
                    >
                      {ankiImporting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>
                            Đang nhập {selectedAnkiDeck.cardCount} thẻ...
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-4" />
                          <span>
                            Hoàn tất nhập ({selectedAnkiDeck.cardCount} thẻ)
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 2: CSV / TSV */}
        {/* ==================================================== */}
        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSpreadsheet className="text-primary size-5" />
                Nhập từ file CSV / TSV
              </CardTitle>
              <CardDescription>
                Tải lên file bảng tính hoặc dán dữ liệu CSV, tự động nhận diện
                dấu phân cách và ánh xạ các cột.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dropzone */}
              <div
                className="border-border/80 hover:border-primary/50 hover:bg-primary/5 group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all"
                onClick={() =>
                  document.getElementById("csv-file-input")?.click()
                }
              >
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv,.tsv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleCsvFileChange(f)
                  }}
                />
                <div className="from-primary/10 to-primary/5 text-primary mb-2 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110">
                  <UploadCloud className="size-5" />
                </div>
                <div className="text-sm font-semibold">
                  {csvFile
                    ? csvFile.name
                    : "Kéo thả file CSV/TSV hoặc nhấp để chọn"}
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  {csvFile
                    ? `Dung lượng: ${(csvFile.size / 1024).toFixed(1)} KB`
                    : "Hỗ trợ định dạng .csv, .tsv"}
                </div>
              </div>

              {/* Or paste content directly */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  Hoặc dán nội dung CSV/TSV vào đây:
                </label>
                <Textarea
                  rows={4}
                  value={csvRawContent}
                  onChange={(e) => handleCsvTextChange(e.target.value)}
                  placeholder={`Term,Reading,Definition,Example\n食べる,たべる,Ăn,ご飯を食べる\n飲む,のむ,Uống,水を飲む`}
                  className="font-mono text-xs"
                />
              </div>

              {csvLoadingPreview && (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-4 text-xs">
                  <Loader2 className="text-primary size-4 animate-spin" />
                  <span>Đang phân tích cấu trúc CSV...</span>
                </div>
              )}

              {/* CSV Settings & Column Mapping */}
              {csvPreviewHeaders.length > 0 && (
                <div className="space-y-6 pt-2">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold">
                        Tên bộ thẻ *
                      </label>
                      <Input
                        value={csvSetName}
                        onChange={(e) => setCsvSetName(e.target.value)}
                        placeholder="VD: Từ vựng N4 CSV"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">
                        Lưu vào thư mục
                      </label>
                      <Select
                        value={csvFolderId}
                        onChange={(e) => setCsvFolderId(e.target.value)}
                      >
                        <option value="">Thư mục gốc (Root)</option>
                        {flattenedFolders.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">
                        Gán nhãn chung
                      </label>
                      <Input
                        value={csvTags}
                        onChange={(e) => setCsvTags(e.target.value)}
                        placeholder="n4, từ vựng"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">
                        Mô tả (tuỳ chọn)
                      </label>
                      <Input
                        value={csvDescription}
                        onChange={(e) => setCsvDescription(e.target.value)}
                        placeholder="Bộ thẻ tạo từ CSV..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">
                        Dấu phân cách (Delimiter)
                      </label>
                      <Select
                        value={csvDelimiter}
                        onChange={(e) => {
                          setCsvDelimiter(e.target.value)
                          if (csvFile) handleCsvFileChange(csvFile)
                          else if (csvRawContent)
                            handleCsvTextChange(csvRawContent)
                        }}
                      >
                        <option value=",">Dấu phẩy ( , )</option>
                        <option value="	">Dấu Tab ( \t )</option>
                        <option value=";">Dấu chấm phẩy ( ; )</option>
                        <option value="|">Dấu gạch đứng ( | )</option>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="csv-header-check"
                        checked={csvHasHeader}
                        onChange={(e) => setCsvHasHeader(e.target.checked)}
                        className="border-border text-primary focus:ring-primary size-4 rounded"
                      />
                      <label
                        htmlFor="csv-header-check"
                        className="cursor-pointer text-xs font-medium"
                      >
                        Dòng đầu tiên là tiêu đề (Header)
                      </label>
                    </div>
                  </div>

                  {/* Column mapping selectors */}
                  <div className="border-border/60 bg-muted/30 space-y-3 rounded-2xl border p-4">
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                      <Layers className="text-primary size-3.5" />
                      Ánh xạ các cột CSV
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                      <div className="space-y-1">
                        <label className="text-foreground text-[11px] font-medium">
                          Từ vựng (Term) *
                        </label>
                        <Select
                          value={String(csvColumnMapping.termIndex)}
                          onChange={(e) =>
                            setCsvColumnMapping((prev) => ({
                              ...prev,
                              termIndex: Number(e.target.value),
                            }))
                          }
                        >
                          {csvPreviewHeaders.map((h, idx) => (
                            <option key={idx} value={String(idx)}>
                              Cột {idx + 1}: {h}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-foreground text-[11px] font-medium">
                          Cách đọc (Reading)
                        </label>
                        <Select
                          value={
                            csvColumnMapping.readingIndex !== undefined &&
                            csvColumnMapping.readingIndex !== null
                              ? String(csvColumnMapping.readingIndex)
                              : "-1"
                          }
                          onChange={(e) =>
                            setCsvColumnMapping((prev) => ({
                              ...prev,
                              readingIndex:
                                Number(e.target.value) >= 0
                                  ? Number(e.target.value)
                                  : undefined,
                            }))
                          }
                        >
                          <option value="-1">-- Không có (dùng Term) --</option>
                          {csvPreviewHeaders.map((h, idx) => (
                            <option key={idx} value={String(idx)}>
                              Cột {idx + 1}: {h}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-foreground text-[11px] font-medium">
                          Định nghĩa (Definition) *
                        </label>
                        <Select
                          value={String(csvColumnMapping.definitionIndex)}
                          onChange={(e) =>
                            setCsvColumnMapping((prev) => ({
                              ...prev,
                              definitionIndex: Number(e.target.value),
                            }))
                          }
                        >
                          {csvPreviewHeaders.map((h, idx) => (
                            <option key={idx} value={String(idx)}>
                              Cột {idx + 1}: {h}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-foreground text-[11px] font-medium">
                          Ví dụ (Example)
                        </label>
                        <Select
                          value={
                            csvColumnMapping.exampleIndex !== undefined &&
                            csvColumnMapping.exampleIndex !== null
                              ? String(csvColumnMapping.exampleIndex)
                              : "-1"
                          }
                          onChange={(e) =>
                            setCsvColumnMapping((prev) => ({
                              ...prev,
                              exampleIndex:
                                Number(e.target.value) >= 0
                                  ? Number(e.target.value)
                                  : undefined,
                            }))
                          }
                        >
                          <option value="-1">-- Không có --</option>
                          {csvPreviewHeaders.map((h, idx) => (
                            <option key={idx} value={String(idx)}>
                              Cột {idx + 1}: {h}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Preview Table */}
                  {csvPreviewRows.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-muted-foreground text-xs font-semibold">
                        Bảng xem trước dữ liệu (Mẫu {csvPreviewRows.length}{" "}
                        dòng):
                      </div>
                      <div className="border-border overflow-x-auto rounded-xl border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead className="w-12 text-center text-xs">
                                #
                              </TableHead>
                              {csvPreviewHeaders.map((h, i) => (
                                <TableHead
                                  key={i}
                                  className="text-xs font-semibold"
                                >
                                  {h}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csvPreviewRows.map((row, rIdx) => (
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
                      onClick={handleImportCsv}
                      disabled={csvImporting}
                      className="gap-2 rounded-xl px-6"
                    >
                      {csvImporting ? (
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
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 3: TEXT (Quizlet copy-paste) */}
        {/* ==================================================== */}
        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="text-primary size-5" />
                Nhập văn bản thô (Quizlet copy-paste)
              </CardTitle>
              <CardDescription>
                Dán danh sách từ vựng sao chép từ Quizlet, Excel hoặc Google
                Sheets dạng &quot;Thuật ngữ [Tab] Định nghĩa&quot;.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold">Tên bộ thẻ *</label>
                  <Input
                    value={textSetName}
                    onChange={(e) => setTextSetName(e.target.value)}
                    placeholder="VD: Từ vựng sao chép từ Quizlet"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Lưu vào thư mục
                  </label>
                  <Select
                    value={textFolderId}
                    onChange={(e) => setTextFolderId(e.target.value)}
                  >
                    <option value="">Thư mục gốc (Root)</option>
                    {flattenedFolders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Gán nhãn chung
                  </label>
                  <Input
                    value={textTags}
                    onChange={(e) => setTextTags(e.target.value)}
                    placeholder="quizlet, n5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Mô tả (tuỳ chọn)
                  </label>
                  <Input
                    value={textDescription}
                    onChange={(e) => setTextDescription(e.target.value)}
                    placeholder="Bộ thẻ nhập từ văn bản..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Dấu phân cách giữa Từ & Nghĩa
                  </label>
                  <Select
                    value={termSeparator}
                    onChange={(e) => {
                      setTermSeparator(e.target.value)
                      handleTextChange(textContent)
                    }}
                  >
                    <option value="	">Dấu Tab ( \t )</option>
                    <option value=" - ">Gạch ngang ( - )</option>
                    <option value=":">Dấu hai chấm ( : )</option>
                    <option value=",">Dấu phẩy ( , )</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Dấu phân cách giữa các thẻ
                  </label>
                  <Select
                    value={cardSeparator}
                    onChange={(e) => {
                      setCardSeparator(e.target.value)
                      handleTextChange(textContent)
                    }}
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

              <div className="space-y-1.5">
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
                  value={textContent}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={`犬	Con chó\n猫	Con mèo\n本（ほん） - Quyển sách\n車（くるま） - Xe ô tô`}
                  className="font-mono text-xs"
                />
              </div>

              {/* Text Preview Table */}
              {textPreviewCards.length > 0 && (
                <div className="space-y-2">
                  <div className="text-muted-foreground text-xs font-semibold">
                    Xem trước ({textPreviewCards.length} thẻ được nhận diện):
                  </div>
                  <div className="border-border overflow-hidden rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-12 text-center text-xs">
                            #
                          </TableHead>
                          <TableHead className="text-xs">
                            Từ vựng (Term)
                          </TableHead>
                          <TableHead className="text-xs">
                            Cách đọc (Reading)
                          </TableHead>
                          <TableHead className="text-xs">
                            Định nghĩa (Definition)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {textPreviewCards.map((c, idx) => (
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
                            <TableCell className="text-xs">
                              {c.definition}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleImportText}
                  disabled={textImporting || !textContent.trim()}
                  className="gap-2 rounded-xl px-6"
                >
                  {textImporting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Đang tạo bộ thẻ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      <span>Nhập {textPreviewCards.length} thẻ</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 4: JSON */}
        {/* ==================================================== */}
        <TabsContent value="json" className="space-y-4">
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
            <CardContent className="space-y-6">
              {/* Dropzone */}
              <div
                className="border-border/80 hover:border-primary/50 hover:bg-primary/5 group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all"
                onClick={() =>
                  document.getElementById("json-file-input")?.click()
                }
              >
                <input
                  id="json-file-input"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleJsonFileChange(f)
                  }}
                />
                <div className="from-primary/10 to-primary/5 text-primary mb-2 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110">
                  <FileJson className="size-5" />
                </div>
                <div className="text-sm font-semibold">
                  {jsonFile
                    ? jsonFile.name
                    : "Kéo thả file JSON hoặc nhấp để chọn"}
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  {jsonFile
                    ? `Dung lượng: ${(jsonFile.size / 1024).toFixed(1)} KB`
                    : "Định dạng JSON chuẩn NihoMemo"}
                </div>
              </div>

              {/* JSON Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  Hoặc dán nội dung JSON vào đây:
                </label>
                <Textarea
                  rows={8}
                  value={jsonContent}
                  onChange={(e) => {
                    setJsonContent(e.target.value)
                    try {
                      const parsed = JSON.parse(e.target.value)
                      const sets = Array.isArray(parsed)
                        ? parsed
                        : Array.isArray(parsed.studySets)
                          ? parsed.studySets
                          : Array.isArray(parsed.sets)
                            ? parsed.sets
                            : [parsed]
                      setJsonParsedSets(sets as ParsedJsonSet[])
                    } catch {
                      setJsonParsedSets(null)
                    }
                  }}
                  placeholder={`{\n  "setName": "Minna no Nihongo Bài 1",\n  "cards": [\n    {\n      "term": "私",\n      "reading": "わたし",\n      "definition": "Tôi"\n    }\n  ]\n}`}
                  className="font-mono text-xs"
                />
              </div>

              {jsonParsedSets && jsonParsedSets.length > 0 && (
                <div className="border-border/60 bg-muted/30 space-y-2 rounded-xl border p-4">
                  <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    Đã nhận diện hợp lệ {jsonParsedSets.length} bộ thẻ:
                  </div>
                  <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs">
                    {jsonParsedSets.map((s, idx) => (
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
                  onClick={handleImportJson}
                  disabled={jsonImporting || !jsonContent.trim()}
                  className="gap-2 rounded-xl px-6"
                >
                  {jsonImporting ? (
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
        </TabsContent>

        {/* ==================================================== */}
        {/* TAB 5: BACKUP & RESTORE */}
        {/* ==================================================== */}
        <TabsContent value="backup" className="space-y-6">
          {/* Section 1: Full Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="text-primary size-5" />
                Sao lưu toàn bộ dữ liệu (Full Backup)
              </CardTitle>
              <CardDescription>
                Tải về toàn bộ cơ sở dữ liệu học tập cá nhân bao gồm: tất cả thư
                mục, bộ thẻ, thẻ, tiến độ SRS, lịch sử phiên học, thống kê hàng
                ngày và mục tiêu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-primary/20 bg-primary/5 flex flex-col items-start justify-between gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="text-foreground text-sm font-semibold">
                    Bản sao lưu hoàn chỉnh (.json)
                  </div>
                  <div className="text-muted-foreground text-xs">
                    An toàn, toàn vẹn 100%, có thể khôi phục lại bất kỳ lúc nào
                    trên mọi máy tính.
                  </div>
                </div>
                <a
                  href="/api/export/backup"
                  download
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download className="size-4" />
                  <span>Tải bản sao lưu toàn bộ</span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Export Individual Sets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Layers className="text-primary size-5" />
                    Xuất các bộ thẻ học tập (Export Sets)
                  </CardTitle>
                  <CardDescription>
                    Tải về từng bộ thẻ hoặc xuất toàn bộ thư viện dưới định dạng
                    JSON hoặc CSV.
                  </CardDescription>
                </div>
                <a
                  href="/api/export/all"
                  download
                  className="bg-muted hover:bg-muted/80 text-foreground flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  <Download className="size-3.5" />
                  <span>Xuất tất cả bộ thẻ (.json)</span>
                </a>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSets ? (
                <div className="text-muted-foreground py-6 text-center text-xs">
                  Đang tải danh sách bộ thẻ...
                </div>
              ) : userSets.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-xs">
                  Chưa có bộ thẻ nào trong thư viện.
                </div>
              ) : (
                <div className="border-border divide-border/60 divide-y rounded-xl border">
                  {userSets.map((set) => (
                    <div
                      key={set.id}
                      className="hover:bg-muted/30 flex items-center justify-between p-3 text-xs transition-colors"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-foreground truncate font-semibold">
                          {set.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-[10px]"
                        >
                          {set.cardCount} thẻ
                        </Badge>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <a
                          href={`/api/export/set/${set.id}?format=json`}
                          download
                          className="hover:bg-primary/10 hover:text-primary rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors"
                          title="Tải về định dạng JSON"
                        >
                          JSON
                        </a>
                        <a
                          href={`/api/export/set/${set.id}?format=csv`}
                          download
                          className="hover:bg-primary/10 hover:text-primary rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors"
                          title="Tải về định dạng CSV"
                        >
                          CSV
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Restore Data */}
          <Card className="border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-amber-600 dark:text-amber-400">
                <RotateCcw className="size-5" />
                Phục hồi dữ liệu (Restore)
              </CardTitle>
              <CardDescription>
                Khôi phục lại toàn bộ dữ liệu từ file sao lưu JSON đã tải về
                trước đó.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="font-semibold">Lưu ý quan trọng:</span> Quá
                  trình phục hồi sẽ tái tạo lại các thư mục, bộ thẻ, thẻ từ vựng
                  và lịch sử học tập từ file sao lưu.
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                  className="text-xs"
                />
                <Button
                  onClick={() => {
                    if (!restoreFile) {
                      toast.error("Vui lòng chọn file sao lưu JSON trước.")
                      return
                    }
                    setRestoreConfirmOpen(true)
                  }}
                  disabled={!restoreFile || restoring}
                  variant="outline"
                  className="shrink-0 gap-2 rounded-xl text-xs font-semibold"
                >
                  <RotateCcw className="size-4" />
                  <span>Tiến hành phục hồi</span>
                </Button>
              </div>

              {restoreSummary && (
                <div className="space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-200">
                  <div className="flex items-center gap-1.5 text-sm font-bold">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    Kết quả phục hồi dữ liệu:
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono sm:grid-cols-3">
                    <div>• Thư mục: {restoreSummary.restoredFoldersCount}</div>
                    <div>• Bộ thẻ: {restoreSummary.restoredSetsCount}</div>
                    <div>• Thẻ học: {restoreSummary.restoredCardsCount}</div>
                    <div>• Nhãn: {restoreSummary.restoredTagsCount}</div>
                    <div>
                      • Phiên học: {restoreSummary.restoredSessionsCount}
                    </div>
                    <div>
                      • Thống kê ngày: {restoreSummary.restoredStatsCount}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Restore */}
      <Dialog open={restoreConfirmOpen} onOpenChange={setRestoreConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-5" />
              Xác nhận phục hồi dữ liệu
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs leading-relaxed">
              Bạn có chắc chắn muốn phục hồi dữ liệu từ file{" "}
              <span className="text-foreground font-mono font-semibold">
                {restoreFile?.name}
              </span>
              ? Quá trình này sẽ thêm lại tất cả thư mục, bộ thẻ, thẻ và lịch sử
              học tập vào tài khoản của bạn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRestoreConfirmOpen(false)}
              disabled={restoring}
              className="rounded-xl text-xs"
            >
              Huỷ bỏ
            </Button>
            <Button
              onClick={handleRestoreSubmit}
              disabled={restoring}
              className="gap-2 rounded-xl bg-amber-600 text-xs text-white hover:bg-amber-700"
            >
              {restoring ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang phục hồi...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="size-4" />
                  <span>Xác nhận phục hồi ngay</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
