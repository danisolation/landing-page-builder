import { test, expect, Page } from "@playwright/test";

const BASE_URL = "http://localhost:3001";
const API_URL = "http://localhost:3000";

// Token dùng chung cho cả file — tránh UI login và /auth rate-limit (5 req/phút)
let cachedToken: string | null = null;

async function getApiToken(): Promise<string> {
  let token = cachedToken;
  if (!token) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "123456" }),
    });
    const json = (await res.json()) as { data: { access_token: string } };
    token = json.data.access_token;
    cachedToken = token;
  }
  return token;
}

async function login(page: Page) {
  const token = await getApiToken();
  await page.context().addCookies([
    { name: "token", value: token, domain: "localhost", path: "/" },
  ]);
  await page.addInitScript((t: string) => localStorage.setItem("token", t), token);
  await page.goto(`${BASE_URL}/vi/dashboard`);
  await page.getByText("Tổng pages").first().waitFor({ timeout: 20000 });
}

test.describe("Page Templates", () => {
  // Chạy tuần tự — tránh 2 worker cùng login/compile route trên dev server
  test.describe.configure({ mode: "serial" });

  test("gallery shows blank + built-in templates with preview", async ({
    page,
  }) => {
    await login(page);
    await page.goto(`${BASE_URL}/vi/pages/new`);

    // Gallery visible with blank + 4 built-ins
    await expect(page.getByText("Chọn template")).toBeVisible();
    await expect(page.getByText("Trang trống", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Sản phẩm SaaS", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Ra mắt sản phẩm", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Sự kiện", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Agency / Portfolio", { exact: true }),
    ).toBeVisible();

    // Blank selected by default
    await expect(
      page.locator('div[role="button"]', { hasText: "Trang trống" }),
    ).toHaveAttribute("aria-pressed", "true");

    // Preview opens full page modal without open-in-new-tab link
    await page
      .locator('div[role="button"]', { hasText: "Sản phẩm SaaS" })
      .locator("button", { hasText: "Xem trước" })
      .click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: "Quản lý công việc thông minh hơn" }),
    ).toBeVisible();
    await expect(dialog.locator('a[target="_blank"]')).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("create page from template, save as template, delete custom template", async ({
    page,
  }) => {
    const slug = `e2e-template-${Date.now()}`;
    const templateName = `E2E Custom ${Date.now()}`;

    await login(page);
    await page.goto(`${BASE_URL}/vi/pages/new`);

    // Select SaaS template and create page
    await page
      .locator('div[role="button"]', { hasText: "Sản phẩm SaaS" })
      .click();
    await page.fill('input[id="title"]', "E2E Template Page");
    await page.fill('input[id="slug"]', slug);
    await page.click('button[type="submit"]');

    // Redirects to editor — hero template render trên canvas (visual editor)
    await page.waitForURL("**/edit", { timeout: 15000 });
    await expect(
      page.locator('h1[title="Click to edit"]', {
        hasText: "Quản lý công việc thông minh hơn",
      }),
    ).toBeVisible({ timeout: 20000 });

    // Save current page as custom template
    await page.locator("button", { hasText: "Lưu thành template" }).click();
    await page.fill('input[id="template-name"]', templateName);
    await page.locator("button", { hasText: "Lưu template" }).click();
    await expect(page.getByText("Đã lưu template!")).toBeVisible({
      timeout: 10000,
    });

    // Custom template appears in gallery with badge
    await page.goto(`${BASE_URL}/vi/pages/new`);
    const customCard = page.locator('div[role="button"]', {
      hasText: templateName,
    });
    await expect(customCard).toBeVisible();
    await expect(customCard.getByText("Tùy chỉnh")).toBeVisible();

    // Delete custom template (confirm dialog)
    await customCard.locator('button[aria-label="Xóa template"]').click();
    await page.locator("button", { hasText: "Xác nhận" }).click();
    await expect(customCard).toHaveCount(0, { timeout: 10000 });

    // Cleanup: delete the created page via API
    const token = await getApiToken();
    const pagesRes = await fetch(`${API_URL}/pages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const pagesJson = await pagesRes.json();
    const created = pagesJson.data.find(
      (p: { slug: string }) => p.slug === slug,
    );
    if (created) {
      await fetch(`${API_URL}/pages/${created.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  });
});
