"use client"

import * as React from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PasswordInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  "type"
> {
  showIcon?: boolean
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, showIcon = true, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative">
      {showIcon && (
        <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      )}
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        className={cn(showIcon ? "pl-9" : "pl-3", "pr-9", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        tabIndex={-1}
        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {showPassword ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
    </div>
  )
})

PasswordInput.displayName = "PasswordInput"
