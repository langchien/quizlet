"use client"

import * as React from "react"
import Link from "next/link"
import { LogIn, UserPlus, LogOut, User } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/types"
import type { AuthUser } from "@/stores/useAuthStore"

interface LandingHeaderProps {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  onLogout: () => void
}

export function LandingHeader({
  user,
  isAuthenticated,
  isLoading,
  onLogout,
}: LandingHeaderProps) {
  return (
    <header className="border-border/40 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="from-primary text-primary-foreground shadow-primary/20 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br to-rose-600 shadow-md">
            <span className="text-lg font-bold">日</span>
          </div>
          <div>
            <span className="text-foreground text-xl font-bold tracking-tight">
              {APP_NAME}
            </span>
            <span className="text-muted-foreground ml-1.5 hidden text-xs font-medium sm:inline-block">
              (日本メモ)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="border-border/70 bg-card hidden items-center gap-2 rounded-full border px-3 py-1 text-xs sm:flex">
                <User className="text-primary size-3.5" />
                <span className="font-medium">{user.name}</span>
                <Badge variant="success" className="h-4 px-1.5 text-[10px]">
                  Đã đăng nhập
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                disabled={isLoading}
                className="gap-1.5"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-1.5"
                )}
              >
                <LogIn className="size-3.5" />
                <span>Đăng nhập</span>
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
              >
                <UserPlus className="size-3.5" />
                <span className="hidden sm:inline">Đăng ký</span>
              </Link>
            </div>
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
