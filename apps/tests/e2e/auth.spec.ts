import { test, expect } from "@playwright/test"

test.describe("E2E: Xác thực & Điều hướng (Auth Flow)", () => {
  test("Đăng nhập bằng tài khoản Quản trị viên và chuyển hướng đến Dashboard", async ({
    page,
  }) => {
    // 1. Mở trang đăng nhập
    await page.goto("/login")
    await expect(page).toHaveTitle(/NihoMemo/)
    await expect(
      page.locator("h2, .text-2xl").filter({ hasText: "Đăng nhập NihoMemo" })
    ).toBeVisible()

    // 2. Điền thông tin đăng nhập
    await page.locator("#email").fill("admin@nihomemo.local")
    await page.locator("#password").fill("admin123456")

    // 3. Nhấn nút Đăng nhập
    await page.locator('button[type="submit"]').click()

    // 4. Kỳ vọng chuyển hướng vào trang chính / hoặc /dashboard
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 10000,
    })
    expect(page.url()).not.toContain("/login")

    // 5. Kiểm tra thanh Sidebar hiển thị tên thương hiệu NihoMemo
    await expect(page.locator("text=NihoMemo").first()).toBeVisible()
  })

  test("Chuyển hướng về /login khi chưa đăng nhập và truy cập route được bảo vệ", async ({
    page,
  }) => {
    // Đảm bảo không có cookie
    await page.context().clearCookies()
    await page.goto("/settings")

    // Middleware sẽ chặn và chuyển về /login
    await page.waitForURL((url) => url.pathname.includes("/login"))
    expect(page.url()).toContain("/login")
  })
})
