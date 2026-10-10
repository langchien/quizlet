"use client"

import * as React from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

export interface PasswordInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  "type"
> {
  showIcon?: boolean
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, showIcon = true, disabled, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <InputGroup className={className}>
      {showIcon && (
        <InputGroupAddon align="inline-start">
          <Lock />
        </InputGroupAddon>
      )}
      <InputGroupInput
        ref={ref}
        type={showPassword ? "text" : "password"}
        disabled={disabled}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          disabled={disabled}
          onClick={() => setShowPassword((prev) => !prev)}
          title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
})

PasswordInput.displayName = "PasswordInput"
