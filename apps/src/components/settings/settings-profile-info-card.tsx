"use client"

import * as React from "react"
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

export interface SettingsProfileInfoCardProps {
  email?: string | null
  name: string
  setName: (name: string) => void
  avatar: string
  setAvatar: (avatar: string) => void
  savingProfile: boolean
  onSaveProfile: (e: React.FormEvent) => void
}

export function SettingsProfileInfoCard({
  email,
  name,
  setName,
  avatar,
  setAvatar,
  savingProfile,
  onSaveProfile,
}: SettingsProfileInfoCardProps) {
  const avatarFallback = name?.charAt(0)?.toUpperCase() || "U"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Thông tin người dùng</CardTitle>
        <CardDescription>
          Cập nhật tên hiển thị công khai và liên kết ảnh đại diện.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSaveProfile}>
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
                avatarFallback
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-foreground text-sm font-semibold">{email}</p>
              <p className="text-muted-foreground text-xs">
                Tài khoản được liên kết với email này. Không thể thay đổi email
                sau khi đăng ký.
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
  )
}
