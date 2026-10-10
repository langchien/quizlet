"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { LoginForm } from "@/components/auth"

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="border-border/70 bg-card/85 flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl">
          <Loader2 className="text-primary size-8 animate-spin" />
          <p className="text-muted-foreground mt-2 text-sm">
            Đang tải trang đăng nhập...
          </p>
        </Card>
      }
    >
      <LoginForm />
    </React.Suspense>
  )
}
