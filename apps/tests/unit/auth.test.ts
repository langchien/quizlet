import { describe, it, expect } from "vitest"
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth"

describe("Kiểm thử module Xác thực (Auth Logic)", () => {
  it("Băm mật khẩu và so sánh mật khẩu chính xác với bcrypt", async () => {
    const rawPassword = "securePassword123!@#"
    const hashed = await hashPassword(rawPassword)

    expect(hashed).toBeDefined()
    expect(hashed).not.toBe(rawPassword)
    expect(hashed.startsWith("$2")).toBe(true)

    const isMatch = await comparePassword(rawPassword, hashed)
    expect(isMatch).toBe(true)

    const isWrong = await comparePassword("wrongPassword123", hashed)
    expect(isWrong).toBe(false)
  })

  it("Tạo và xác minh Access Token hợp lệ", async () => {
    const payload = {
      userId: "user_test_12345",
      email: "tester@nihomemo.local",
    }

    const token = await signAccessToken(payload)
    expect(typeof token).toBe("string")
    expect(token.split(".").length).toBe(3)

    const verified = await verifyAccessToken(token)
    expect(verified).not.toBeNull()
    expect(verified?.userId).toBe(payload.userId)
    expect(verified?.email).toBe(payload.email)
  })

  it("Tạo và xác minh Refresh Token hợp lệ", async () => {
    const payload = {
      userId: "user_test_refresh_999",
    }

    const token = await signRefreshToken(payload)
    expect(typeof token).toBe("string")
    expect(token.split(".").length).toBe(3)

    const verified = await verifyRefreshToken(token)
    expect(verified).not.toBeNull()
    expect(verified?.userId).toBe(payload.userId)
  })

  it("Trả về null khi xác minh token không hợp lệ hoặc bị can thiệp", async () => {
    const invalidToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"
    const verifiedAccess = await verifyAccessToken(invalidToken)
    expect(verifiedAccess).toBeNull()

    const verifiedRefresh = await verifyRefreshToken(invalidToken)
    expect(verifiedRefresh).toBeNull()

    const emptyToken = ""
    expect(await verifyAccessToken(emptyToken)).toBeNull()
    expect(await verifyRefreshToken(emptyToken)).toBeNull()
  })
})
