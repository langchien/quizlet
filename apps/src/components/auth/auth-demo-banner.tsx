import * as React from "react"
import { Sparkles } from "lucide-react"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface AuthDemoBannerProps {
  onFillDemo: () => void
  email?: string
  password?: string
  className?: string
}

export function AuthDemoBanner({
  onFillDemo,
  email = "admin@nihomemo.local",
  password = "admin123456",
  className,
}: AuthDemoBannerProps) {
  return (
    <Alert
      className={className ?? "border-primary/20 bg-primary/5 text-primary"}
    >
      <Sparkles />
      <AlertTitle className="text-xs font-semibold">
        Tài khoản thử nghiệm sẵn sàng:
      </AlertTitle>
      <AlertDescription className="text-muted-foreground font-mono text-[11px]">
        {email} / {password}
      </AlertDescription>
      <AlertAction>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={onFillDemo}
          className="border-primary/30 hover:bg-primary/20"
        >
          Điền nhanh
        </Button>
      </AlertAction>
    </Alert>
  )
}
