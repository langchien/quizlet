"use client"

import * as React from "react"
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useLoginForm } from "@/hooks/auth"
import { AuthCardWrapper } from "./auth-card-wrapper"
import { AuthDemoBanner } from "./auth-demo-banner"
import { AuthSubmitButton } from "./auth-submit-button"

export function LoginForm() {
  const {
    register,
    errors,
    isLoading,
    showPassword,
    toggleShowPassword,
    fillAdminAccount,
    handleSubmit,
  } = useLoginForm()

  return (
    <AuthCardWrapper
      icon={<LogIn className="size-6" />}
      title="Đăng nhập NihoMemo"
      description="Tiếp tục lộ trình học từ vựng, Kanji và ngữ pháp tiếng Nhật"
      footerText="Chưa có tài khoản?"
      footerLinkText="Tạo tài khoản mới"
      footerLinkHref="/register"
    >
      {/* Tài khoản mẫu */}
      <AuthDemoBanner onFillDemo={fillAdminAccount} />

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/* Email Field */}
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Địa chỉ Email</FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Mail />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="name@example.com"
                disabled={isLoading}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </InputGroup>
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          {/* Password Field */}
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Lock />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading}
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  onClick={toggleShowPassword}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {errors.password && (
              <FieldError>{errors.password.message}</FieldError>
            )}
          </Field>

          {/* Submit Button */}
          <AuthSubmitButton
            isLoading={isLoading}
            loadingText="Đang xử lý đăng nhập..."
          >
            Đăng nhập
          </AuthSubmitButton>
        </FieldGroup>
      </form>
    </AuthCardWrapper>
  )
}
