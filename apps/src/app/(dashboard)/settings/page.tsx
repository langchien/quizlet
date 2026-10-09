"use client"

import * as React from "react"
import Link from "next/link"
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Laptop,
  Keyboard,
  Volume2,
  Brain,
  Download,
  Save,
  KeyRound,
  RotateCcw,
  AlertCircle,
  Play,
  ExternalLink,
} from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useTheme } from "next-themes"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useTTS } from "@/hooks/useTTS"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const { speak, isPlaying, voices } = useTTS()

  // Tab state
  const [activeTab, setActiveTab] = React.useState("profile")
  const [savingProfile, setSavingProfile] = React.useState(false)
  const [savingPassword, setSavingPassword] = React.useState(false)
  const [savingSettings, setSavingSettings] = React.useState(false)

  // 1. Profile State
  const [name, setName] = React.useState("")
  const [avatar, setAvatar] = React.useState("")

  // Password State
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  // 2. Appearance State
  const [fontSize, setFontSize] = React.useState<"sm" | "md" | "lg">("md")
  const [japaneseFont, setJapaneseFont] = React.useState("noto")

  // 3. Study & SRS State
  const [srsMode, setSrsMode] = React.useState<"auto" | "simple" | "advanced">(
    "auto"
  )
  const [dailyGoalCards, setDailyGoalCards] = React.useState(20)
  const [dailyTimeTarget, setDailyTimeTarget] = React.useState(15)
  const [autoPlayAudio, setAutoPlayAudio] = React.useState(true)
  const [ttsRate, setTtsRate] = React.useState(1.0)
  const [ttsVoice, setTtsVoice] = React.useState("")

  // 4. Keyboard Shortcuts State
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] =
    React.useState(true)

  // Đồng bộ state khi user data đã tải
  React.useEffect(() => {
    if (user) {
      setName(user.name || "")
      setAvatar(user.avatar || "")

      const userSettings =
        user.settings && typeof user.settings === "object"
          ? (user.settings as Record<string, unknown>)
          : {}

      if (userSettings.fontSize)
        setFontSize(userSettings.fontSize as "sm" | "md" | "lg")
      if (userSettings.japaneseFont)
        setJapaneseFont(String(userSettings.japaneseFont))
      if (userSettings.srsMode)
        setSrsMode(userSettings.srsMode as "auto" | "simple" | "advanced")
      if (userSettings.dailyGoal)
        setDailyGoalCards(Number(userSettings.dailyGoal))
      if (userSettings.dailyTimeTarget)
        setDailyTimeTarget(Number(userSettings.dailyTimeTarget))
      if (userSettings.autoPlayAudio !== undefined)
        setAutoPlayAudio(Boolean(userSettings.autoPlayAudio))
      if (userSettings.ttsRate) setTtsRate(Number(userSettings.ttsRate))
      if (userSettings.ttsVoice) setTtsVoice(String(userSettings.ttsVoice))
      if (userSettings.keyboardShortcuts !== undefined) {
        setKeyboardShortcutsEnabled(Boolean(userSettings.keyboardShortcuts))
      }

      // Lấy từ UserGoal nếu có
      if (user.goal && typeof user.goal === "object") {
        const goal = user.goal as {
          dailyCardTarget?: number
          dailyTimeTarget?: number
        }
        if (goal.dailyCardTarget) setDailyGoalCards(goal.dailyCardTarget)
        if (goal.dailyTimeTarget) setDailyTimeTarget(goal.dailyTimeTarget)
      }
    }
  }, [user])

  // Lưu thông tin cá nhân
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên hiển thị.")
      return
    }

    setSavingProfile(true)
    try {
      const res = await api.patch("/api/auth/me", {
        name: name.trim(),
        avatar: avatar.trim() || null,
      })
      if (res.data?.user) {
        setUser(res.data.user)
      }
      toast.success("Cập nhật thông tin cá nhân thành công!")
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined
      toast.error(errorMsg || "Không thể cập nhật hồ sơ.")
    } finally {
      setSavingProfile(false)
    }
  }

  // Đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại.")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không trùng khớp.")
      return
    }

    setSavingPassword(true)
    try {
      await api.patch("/api/auth/me", {
        currentPassword,
        newPassword,
      })
      toast.success("Đổi mật khẩu thành công!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined
      toast.error(errorMsg || "Đổi mật khẩu thất bại.")
    } finally {
      setSavingPassword(false)
    }
  }

  // Lưu cài đặt chung (Appearance, Study, Shortcuts)
  const handleSaveAllSettings = async () => {
    setSavingSettings(true)
    try {
      const payloadSettings = {
        theme,
        fontSize,
        japaneseFont,
        srsMode,
        dailyGoal: dailyGoalCards,
        dailyTimeTarget,
        keyboardShortcuts: keyboardShortcutsEnabled,
        autoPlayAudio,
        ttsRate,
        ttsVoice: ttsVoice || undefined,
      }

      const res = await api.patch("/api/auth/me", {
        settings: payloadSettings,
      })

      if (res.data?.user) {
        setUser(res.data.user)
      }
      toast.success("Đã lưu các thiết lập cài đặt!")
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined
      toast.error(errorMsg || "Lỗi khi lưu cài đặt.")
    } finally {
      setSavingSettings(false)
    }
  }

  // Thử giọng phát âm tiếng Nhật
  const handleTestTTS = () => {
    speak(
      "こんにちは、日本語の勉強を始めましょう！",
      ttsRate,
      ttsVoice || undefined
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <SettingsIcon className="text-primary size-7" />
            <span>Cài đặt hệ thống</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tùy biến tài khoản, giao diện hiển thị, phương pháp ghi nhớ SRS và
            phím tắt thông minh.
          </p>
        </div>

        <Button
          onClick={handleSaveAllSettings}
          disabled={savingSettings}
          className="gap-2 self-start shadow-sm sm:self-auto"
        >
          <Save className="size-4" />
          <span>{savingSettings ? "Đang lưu..." : "Lưu tất cả cài đặt"}</span>
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1.5 sm:grid-cols-5">
          <TabsTrigger
            value="profile"
            className="gap-2 py-2 text-xs font-medium"
          >
            <User className="size-4" />
            <span>Hồ sơ</span>
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="gap-2 py-2 text-xs font-medium"
          >
            <Moon className="size-4" />
            <span>Giao diện</span>
          </TabsTrigger>
          <TabsTrigger value="study" className="gap-2 py-2 text-xs font-medium">
            <Brain className="size-4" />
            <span>Học & SRS</span>
          </TabsTrigger>
          <TabsTrigger
            value="shortcuts"
            className="gap-2 py-2 text-xs font-medium"
          >
            <Keyboard className="size-4" />
            <span>Phím tắt</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2 py-2 text-xs font-medium">
            <Download className="size-4" />
            <span>Dữ liệu</span>
          </TabsTrigger>
        </TabsList>

        {/* ---------------- 1. TAB HỒ SƠ ---------------- */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin người dùng</CardTitle>
              <CardDescription>
                Cập nhật tên hiển thị công khai và liên kết ảnh đại diện.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveProfile}>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary border-border/80 flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border text-xl font-bold shadow-inner">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="size-full object-cover"
                        onError={() => setAvatar("")}
                      />
                    ) : (
                      name?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-foreground text-sm font-semibold">
                      {user?.email}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Tài khoản được liên kết với email này. Không thể thay đổi
                      email sau khi đăng ký.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Họ và tên hiển thị</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="avatar">Liên kết ảnh đại diện (URL)</Label>
                    <Input
                      id="avatar"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-4">
                <Button type="submit" disabled={savingProfile} size="sm">
                  {savingProfile ? "Đang lưu..." : "Cập nhật hồ sơ"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Đổi mật khẩu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound className="text-primary size-5" />
                <span>Đổi mật khẩu tài khoản</span>
              </CardTitle>
              <CardDescription>
                Bảo vệ tài khoản bằng mật khẩu mạnh kết hợp chữ và số.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">
                      Xác nhận mật khẩu mới
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-4">
                <Button
                  type="submit"
                  disabled={savingPassword || !currentPassword || !newPassword}
                  variant="outline"
                  size="sm"
                >
                  {savingPassword ? "Đang đổi..." : "Cập nhật mật khẩu"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* ---------------- 2. TAB GIAO DIỆN ---------------- */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chủ đề & Màu sắc</CardTitle>
              <CardDescription>
                Tùy chỉnh phong cách giao diện sáng, tối hoặc tự động theo hệ
                điều hành.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`border-border hover:bg-muted/50 flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                    theme === "light"
                      ? "border-primary bg-primary/5 ring-primary/20 ring-2"
                      : ""
                  }`}
                >
                  <Sun className="size-6 text-amber-500" />
                  <span className="text-foreground text-xs font-semibold">
                    Chế độ Sáng
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`border-border hover:bg-muted/50 flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                    theme === "dark"
                      ? "border-primary bg-primary/5 ring-primary/20 ring-2"
                      : ""
                  }`}
                >
                  <Moon className="text-primary size-6" />
                  <span className="text-foreground text-xs font-semibold">
                    Chế độ Tối
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`border-border hover:bg-muted/50 flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                    theme === "system"
                      ? "border-primary bg-primary/5 ring-primary/20 ring-2"
                      : ""
                  }`}
                >
                  <Laptop className="text-muted-foreground size-6" />
                  <span className="text-foreground text-xs font-semibold">
                    Theo Hệ thống
                  </span>
                </button>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Kích cỡ font thẻ học</Label>
                  <Select
                    id="fontSize"
                    value={fontSize}
                    onChange={(e) =>
                      setFontSize(e.target.value as "sm" | "md" | "lg")
                    }
                  >
                    <option value="sm">Nhỏ gọn (Thích hợp màn hình nhỏ)</option>
                    <option value="md">Tiêu chuẩn (Khuyên dùng)</option>
                    <option value="lg">
                      Lớn & Rõ nét (Dễ nhìn chữ Hán phức tạp)
                    </option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="japaneseFont">
                    Font chữ tiếng Nhật hiển thị
                  </Label>
                  <Select
                    id="japaneseFont"
                    value={japaneseFont}
                    onChange={(e) => setJapaneseFont(e.target.value)}
                  >
                    <option value="noto">
                      Noto Sans JP (Chuẩn mực Google Fonts)
                    </option>
                    <option value="gothic">
                      Zen Kaku Gothic (Hiện đại, nét thanh)
                    </option>
                    <option value="maru">
                      Kosugi Maru (Tròn trịa dễ thương)
                    </option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- 3. TAB HỌC & SRS ---------------- */}
        <TabsContent value="study" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Phương pháp Spaced Repetition (SRS)
              </CardTitle>
              <CardDescription>
                Cấu hình thuật toán tính toán chu kỳ lặp lại thẻ để tối ưu khả
                năng ghi nhớ dài hạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="srsMode">Chế độ SRS mặc định</Label>
                <Select
                  id="srsMode"
                  value={srsMode}
                  onChange={(e) =>
                    setSrsMode(e.target.value as "auto" | "simple" | "advanced")
                  }
                >
                  <option value="auto">
                    Tự động thích ứng (Adaptive SM-2 theo tốc độ trả lời -
                    Khuyên dùng)
                  </option>
                  <option value="simple">
                    Đơn giản kiểu Quizlet (4 mức: Repeat / Hard / Okay / Easy)
                  </option>
                  <option value="advanced">
                    Nâng cao SM-2 chuẩn (Thuật toán SuperMemo-2 6 cấp độ 0-5)
                  </option>
                </Select>
                <p className="text-muted-foreground text-xs">
                  {srsMode === "auto" &&
                    "Hệ thống tự động đo thời gian phản hồi: trả lời đúng dưới 5s coi là Dễ, trên 15s coi là Khó."}
                  {srsMode === "simple" &&
                    "Bạn tự chọn mức độ nhớ thẻ: Lặp lại (0 ngày), Khó (1 ngày), Bình thường (3 ngày), Dễ (7 ngày)."}
                  {srsMode === "advanced" &&
                    "Thuật toán SM-2 đầy đủ tính hệ số Ease Factor và chu kỳ Interval toán học nghiêm ngặt."}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dailyGoalCards">
                    Mục tiêu thẻ cần học mỗi ngày
                  </Label>
                  <Input
                    id="dailyGoalCards"
                    type="number"
                    min="5"
                    max="500"
                    value={dailyGoalCards}
                    onChange={(e) =>
                      setDailyGoalCards(Number(e.target.value) || 20)
                    }
                  />
                  <p className="text-muted-foreground text-[11px]">
                    Số lượng thẻ học hoặc ôn tập để duy trì chuỗi Streak.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyTimeTarget">
                    Mục tiêu thời gian học (phút/ngày)
                  </Label>
                  <Input
                    id="dailyTimeTarget"
                    type="number"
                    min="5"
                    max="180"
                    value={dailyTimeTarget}
                    onChange={(e) =>
                      setDailyTimeTarget(Number(e.target.value) || 15)
                    }
                  />
                  <p className="text-muted-foreground text-[11px]">
                    Thời gian luyện tập hàng ngày hiển thị trên Dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Âm thanh & Phát âm (TTS) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Volume2 className="text-primary size-5" />
                <span>Phát âm & Âm thanh (Text-to-Speech)</span>
              </CardTitle>
              <CardDescription>
                Tùy chỉnh phát âm tiếng Nhật tự động bằng công nghệ Web Speech
                API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">
                    Tự động phát âm khi xem thẻ
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Tự động đọc từ tiếng Nhật khi mở hoặc lật sang mặt trước thẻ
                    học.
                  </p>
                </div>
                <Switch
                  checked={autoPlayAudio}
                  onCheckedChange={(checked) => setAutoPlayAudio(checked)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ttsRate">Tốc độ phát âm: {ttsRate}x</Label>
                  <Select
                    id="ttsRate"
                    value={String(ttsRate)}
                    onChange={(e) => setTtsRate(Number(e.target.value))}
                  >
                    <option value="0.75">
                      0.75x (Chậm - phù hợp luyện nghe phát âm chuẩn)
                    </option>
                    <option value="0.9">0.9x (Chậm vừa phải)</option>
                    <option value="1">
                      1.0x (Tốc độ tự nhiên bình thường)
                    </option>
                    <option value="1.25">1.25x (Nhanh vừa)</option>
                    <option value="1.5">1.5x (Nhanh - tăng phản xạ)</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ttsVoice">
                    Giọng đọc tiếng Nhật (Voice ja-JP)
                  </Label>
                  <Select
                    id="ttsVoice"
                    value={ttsVoice}
                    onChange={(e) => setTtsVoice(e.target.value)}
                  >
                    <option value="">
                      -- Tự động chọn giọng chuẩn của hệ thống --
                    </option>
                    {voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="bg-muted/40 border-border/80 flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="text-primary size-4" />
                  <span className="text-foreground text-xs font-medium">
                    Câu mẫu: 「こんにちは、日本語の勉強を始めましょう！」
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestTTS}
                  disabled={isPlaying}
                  className="gap-1.5 text-xs"
                >
                  <Play className="size-3.5" />
                  <span>{isPlaying ? "Đang đọc..." : "Nghe thử giọng"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- 4. TAB PHÍM TẮT ---------------- */}
        <TabsContent value="shortcuts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Phím tắt thông minh</CardTitle>
                  <CardDescription>
                    Tăng tốc độ ôn luyện thẻ và điều hướng hệ thống bằng bàn
                    phím.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    Bật phím tắt
                  </span>
                  <Switch
                    checked={keyboardShortcutsEnabled}
                    onCheckedChange={(checked) =>
                      setKeyboardShortcutsEnabled(checked)
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-border/60 divide-border/40 divide-y rounded-xl border">
                <div className="bg-muted/20 flex items-center justify-between p-3 text-xs font-semibold">
                  <span className="text-foreground">Thao tác</span>
                  <span className="text-foreground">Phím bấm mặc định</span>
                </div>
                <div className="flex items-center justify-between p-3 text-xs">
                  <span className="text-muted-foreground">
                    Lật thẻ Flashcard / Xác nhận
                  </span>
                  <kbd className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                    Space
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 text-xs">
                  <span className="text-muted-foreground">
                    Chuyển thẻ Trước / Kế tiếp
                  </span>
                  <div className="flex items-center gap-1">
                    <kbd className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                      ←
                    </kbd>
                    <kbd className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                      →
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 text-xs">
                  <span className="text-muted-foreground">
                    Đánh giá thẻ: Chưa biết / Lặp lại
                  </span>
                  <kbd className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                    1
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 text-xs">
                  <span className="text-muted-foreground">
                    Đánh giá thẻ: Đã nhớ / Tốt
                  </span>
                  <kbd className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                    2
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 text-xs">
                  <span className="text-muted-foreground">
                    Phát âm âm thanh tiếng Nhật (TTS)
                  </span>
                  <kbd className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                    A
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 text-xs">
                  <span className="text-muted-foreground">
                    Bật / Tắt xáo trộn (Shuffle)
                  </span>
                  <kbd className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                    S
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 text-xs">
                  <span className="text-muted-foreground">
                    Lật ngược câu hỏi / trả lời (Reverse)
                  </span>
                  <kbd className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                    R
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 text-xs">
                  <span className="text-muted-foreground">
                    Tìm kiếm toàn cục
                  </span>
                  <kbd className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                    Ctrl + K / ⌘ + K
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-3 text-xs">
                  <span className="text-muted-foreground">
                    Mở bảng tra cứu phím tắt
                  </span>
                  <kbd className="border-border bg-card rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
                    ?
                  </kbd>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-muted-foreground text-xs">
                  Nhấn{" "}
                  <kbd className="border-border bg-muted rounded border px-1.5 py-0.5 font-mono text-[10px]">
                    ?
                  </kbd>{" "}
                  ở bất kỳ đâu để xem cheatsheet phím tắt nhanh.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setKeyboardShortcutsEnabled(true)
                    toast.success("Đã khôi phục phím tắt về mặc định.")
                  }}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Khôi phục mặc định</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- 5. TAB DỮ LIỆU & SAO LƯU ---------------- */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Sao lưu & Quản lý dữ liệu
              </CardTitle>
              <CardDescription>
                Xuất file sao lưu đầy đủ toàn bộ bộ thẻ, lịch sử học tập và khôi
                phục khi cần thiết.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-border/70 bg-card hover:border-primary/50 flex flex-col items-start justify-between gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <h4 className="text-foreground text-sm font-semibold">
                    Tải về bản sao lưu toàn bộ (Full Backup JSON)
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Bao gồm toàn bộ bộ thẻ, thẻ vựng, dữ liệu lặp lại ngắt quãng
                    (SRS), và nhật ký học tập.
                  </p>
                </div>
                <a
                  href="/api/export/backup"
                  download="nihomemo-backup.json"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "shrink-0 cursor-pointer gap-2"
                  )}
                >
                  <Download className="size-4" />
                  <span>Tải file backup</span>
                </a>
              </div>

              <div className="border-border/70 bg-card hover:border-primary/50 flex flex-col items-start justify-between gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <h4 className="text-foreground text-sm font-semibold">
                    Trung tâm Nhập & Xuất dữ liệu đa định dạng
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Hỗ trợ nhập bộ thẻ từ Anki (.apkg), file CSV/Excel, JSON và
                    khôi phục dữ liệu từ bản sao lưu.
                  </p>
                </div>
                <Link
                  href="/import-export"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "shrink-0 gap-2"
                  )}
                >
                  <ExternalLink className="size-4" />
                  <span>Mở trang Nhập / Xuất</span>
                </Link>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t py-3">
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500">
                <AlertCircle className="size-4 shrink-0" />
                <span>
                  Khuyên bạn nên tạo bản sao lưu định kỳ hàng tuần để bảo vệ lộ
                  trình học tập của mình.
                </span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
