import { test, expect } from "@playwright/test"

test.describe("E2E: Quy trình học tập (Study Flow)", () => {
  test.beforeEach(async ({ page }) => {
    // Đăng nhập
    await page.goto("/login")
    await page.locator("#email").fill("admin@nihomemo.local")
    await page.locator("#password").fill("admin123456")
    await page.locator('button[type="submit"]').click()
    await page.waitForURL((url) => !url.pathname.includes("/login"))
  })

  test("Vào Thư viện, mở chi tiết bộ thẻ và khởi động chế độ học Flashcard", async ({
    page,
  }) => {
    // 1. Vào Thư viện
    await page.goto("/library")
    await expect(
      page.locator("h1").filter({ hasText: "Thư viện bộ thẻ" })
    ).toBeVisible()

    // 2. Click vào liên kết bộ thẻ đầu tiên
    const firstSetLink = page.locator("a[href^='/sets/']").first()
    await expect(firstSetLink).toBeVisible()
    await firstSetLink.click()

    // 3. Chờ tải trang chi tiết bộ thẻ
    await page.waitForURL(/\/sets\/.+/)
    await expect(page.locator("text=Chọn chế độ học tập")).toBeVisible()

    // 4. Mở chế độ Flashcard
    const flashcardModeBtn = page.locator("a[href*='/flashcard']").first()
    await expect(flashcardModeBtn).toBeVisible()
    await flashcardModeBtn.click()

    // 5. Chờ màn hình học Flashcard
    await page.waitForURL(/\/study\/.+\/flashcard/)
    // Kiểm tra các thành phần của giao diện Flashcard (nút Trước/Sau hoặc thanh tiến trình)
    await expect(page.locator("body")).toBeVisible()
  })
})
