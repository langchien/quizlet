"use client"

import * as React from "react"
import { KeyRound } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useProfileSettings } from "@/hooks/settings/use-profile-settings"
import { usePasswordChange } from "@/hooks/settings/use-password-change"

export function SettingsProfileTab() {
  const {
    user,
    name,
    setName,
    avatar,
    setAvatar,
    savingProfile,
    handleSaveProfile,
  } = useProfileSettings()

  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    savingPassword,
    handleChangePassword,
  } = usePasswordChange()

  return (
    <div className="flex flex-col gap-6">
      {/* Thông tin người dùng */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin người dùng</CardTitle>
          <CardDescription>
            Cập nhật tên hiển thị công khai và liên kết ảnh đại diện.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="flex flex-col gap-4">
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
              <div className="flex flex-1 flex-col gap-1">
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Họ và tên hiển thị</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
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
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
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
    </div>
  )
}
