import { test, expect } from "@playwright/test"

test.describe("E2E: Bảng điều khiển (Dashboard Flow)", () => {
  test.beforeEach(async ({ page }) => {
    // Đăng nhập nhanh
    await page.goto("/login")
    await page.locator("#email").fill("admin@nihomemo.local")
    await page.locator("#password").fill("admin123456")
    await page.locator('button[type="submit"]').click()
    await page.waitForURL((url) => !url.pathname.includes("/login"))
  })

  test("Hiển thị đầy đủ thông số thống kê, streak và danh sách cần ôn tập", async ({
    page,
  }) => {
    await page.goto("/dashboard")

    // 1. Kiểm tra tiêu đề trang và lời chào
    await expect(page.locator("h1").first()).toBeVisible()

    // 2. Kiểm tra các thẻ KPI hôm nay
    await expect(page.locator("text=Đã học hôm nay").first()).toBeVisible()
    await expect(
      page.locator("text=Độ chính xác hôm nay").first()
    ).toBeVisible()
    await expect(page.locator("text=Thời gian học").first()).toBeVisible()
    await expect(page.locator("text=Cần ôn tập hôm nay").first()).toBeVisible()

    // 3. Kiểm tra hiển thị mục tiêu học tập
    await expect(
      page.locator("text=Mục tiêu học tập hàng ngày").first()
    ).toBeVisible()
  })
})
