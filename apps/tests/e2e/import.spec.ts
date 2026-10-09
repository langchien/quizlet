import { test, expect } from "@playwright/test"

test.describe("E2E: Nhập & Xuất Dữ Liệu (Import/Export Flow)", () => {
  test.beforeEach(async ({ page }) => {
    // Đăng nhập
    await page.goto("/login")
    await page.locator("#email").fill("admin@nihomemo.local")
    await page.locator("#password").fill("admin123456")
    await page.locator('button[type="submit"]').click()
    await page.waitForURL((url) => !url.pathname.includes("/login"))
  })

  test("Kiểm tra giao diện Import/Export, chuyển đổi giữa các định dạng", async ({
    page,
  }) => {
    await page.goto("/import-export")
    await expect(
      page.locator("h1").filter({ hasText: "Nhập & Xuất Dữ Liệu" })
    ).toBeVisible()

    // 1. Kiểm tra có đủ các tabs
    await expect(
      page.locator("button, [role='tab']").filter({ hasText: "Anki (.apkg)" })
    ).toBeVisible()
    await expect(
      page.locator("button, [role='tab']").filter({ hasText: "CSV / TSV" })
    ).toBeVisible()
    await expect(
      page.locator("button, [role='tab']").filter({ hasText: "Văn bản thô" })
    ).toBeVisible()
    await expect(
      page.locator("button, [role='tab']").filter({ hasText: "JSON" })
    ).toBeVisible()
    await expect(
      page
        .locator("button, [role='tab']")
        .filter({ hasText: "Sao lưu & Khôi phục" })
    ).toBeVisible()

    // 2. Chuyển sang tab Văn bản thô
    await page
      .locator("button, [role='tab']")
      .filter({ hasText: "Văn bản thô" })
      .click()
    const textarea = page.locator("textarea").first()
    await expect(textarea).toBeVisible()

    // 3. Nhập từ vựng dạng text
    await textarea.fill("林檎 - Quả táo\n蜜柑 - Quả quýt\n葡萄 - Quả nho")

    // 4. Chuyển sang tab Sao lưu & Khôi phục
    await page
      .locator("button, [role='tab']")
      .filter({ hasText: "Sao lưu & Khôi phục" })
      .click()
    await expect(page.locator("text=Sao lưu toàn bộ dữ liệu")).toBeVisible()
  })
})
