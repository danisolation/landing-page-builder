import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3001";
const API_URL = "http://localhost:3000";

// Token dùng chung cho cả file — tránh UI login và /auth rate-limit (5 req/phút)
let cachedToken: string | null = null;

async function getApiToken(): Promise<string> {
  let token = cachedToken;
  if (!token) {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "123456" }),
    });
    const json = (await loginRes.json()) as { data: { access_token: string } };
    token = json.data.access_token;
    cachedToken = token;
  }
  return token;
}

async function login(page: any) {
  const token = await getApiToken();
  await page.context().addCookies([
    { name: "token", value: token, domain: "localhost", path: "/" },
  ]);
  await page.addInitScript((t: string) => localStorage.setItem("token", t), token);
  await page.goto(`${BASE_URL}/vi/dashboard`);
  await page.getByText("Tổng pages").first().waitFor({ timeout: 20000 });
}

async function getPageWithSections(): Promise<string | null> {
  const token = await getApiToken();
  const res = await fetch(`${API_URL}/pages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const pages = (await res.json()).data;
  const pageWithSections = pages.find(
    (p: any) => p.sections && p.sections.length > 0,
  );
  return pageWithSections?.id || null;
}

async function openEditor(page: any, pageId: string) {
  await page.goto(`${BASE_URL}/vi/pages/${pageId}/edit`);
  // Hero heading trên canvas (InlineTextEditor gắn title "Click to edit")
  await page.locator('h1[title="Click to edit"]').first().waitFor({
    timeout: 30000,
  });
}

test.describe("Section Edit", () => {
  test.describe.configure({ mode: "serial" });

  test("selecting a section opens the sidebar edit form", async ({
    page,
  }) => {
    const pageId = await getPageWithSections();
    if (!pageId) {
      test.skip();
      return;
    }

    await login(page);
    await openEditor(page, pageId);

    // Click một section trên canvas → sidebar chuyển sang tab Edit
    await page.locator("div.relative.group").first().click();
    await page.locator("#hero-heading").waitFor({ timeout: 10000 });

    // Form editor hiển thị + nút Bỏ chọn để thoát
    await expect(page.getByRole("button", { name: "Bỏ chọn" })).toBeVisible();

    console.log("✅ Sidebar edit form opens on section selection");
  });

  test("sidebar tab buttons work while a section is selected", async ({
    page,
  }) => {
    const pageId = await getPageWithSections();
    if (!pageId) {
      test.skip();
      return;
    }

    await login(page);
    await openEditor(page, pageId);

    // Chọn section → tab Edit hiện form; click tab 'Giao diện' phải chuyển panel
    await page.locator("div.relative.group").first().click();
    await page.locator("#hero-heading").waitFor({ timeout: 10000 });
    await page.getByRole("button", { name: "Giao diện" }).click();
    await expect(page.locator("#primary-color")).toBeVisible({
      timeout: 5000,
    });

    console.log("✅ Style panel opens even with a selected section");
  });

  test("preview button opens full page modal", async ({ page }) => {
    const pageId = await getPageWithSections();
    if (!pageId) {
      test.skip();
      return;
    }

    await login(page);
    await openEditor(page, pageId);

    // Toolbar 'Xem trước' mở modal preview toàn trang
    await page.getByRole("button", { name: "Xem trước", exact: true }).click();
    const closeBtn = page.locator('button[aria-label="Đóng preview"]');
    await expect(closeBtn).toBeVisible({ timeout: 10000 });

    await closeBtn.click();
    await expect(closeBtn).toHaveCount(0, { timeout: 5000 });

    console.log("✅ Preview modal opens and closes correctly");
  });

  test("adding a section via picker appends it to the canvas", async ({
    page,
  }) => {
    const pageId = await getPageWithSections();
    if (!pageId) {
      test.skip();
      return;
    }

    await login(page);
    await openEditor(page, pageId);

    // Thêm section từ SectionPicker
    const before = await page.locator("div.relative.group").count();
    await page.locator('button[aria-label="Logo đối tác"]').click();
    // Sidebar chuyển sang Edit tab — nút Bỏ chọn xuất hiện
    await page.getByRole("button", { name: "Bỏ chọn" }).waitFor({
      timeout: 10000,
    });
    await page.getByRole("button", { name: "Bỏ chọn" }).click();
    const after = await page.locator("div.relative.group").count();
    expect(after).toBeGreaterThan(before);

    // Dọn dẹp: xóa section vừa thêm (confirm dialog)
    const logoCard = page
      .locator("div.relative.group", { hasText: "Companies we work with" })
      .first();
    await logoCard.hover();
    await page.locator('button[aria-label="Xóa"]').click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Xác nhận" })
      .click();
    await page.waitForTimeout(500);
    expect(await page.locator("div.relative.group").count()).toBe(before);

    console.log("✅ Section add + delete via picker verified");
  });
});

test.describe("Dashboard", () => {
  test("should show stats cards and the pages list", async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/vi/dashboard`);
    await page.waitForTimeout(1000);

    // Stats cards should be visible
    const statsCards = page.locator(".grid > div");
    const statsCount = await statsCards.count();
    expect(statsCount).toBeGreaterThanOrEqual(4);

    // Should have page title
    const title = page.locator("h1");
    await expect(title).toContainText(/Dashboard/);

    // Pages list lives on the Pages page (dashboard/pages split)
    await page.getByRole("link", { name: "Pages" }).first().click();
    await page.waitForURL("**/vi/pages", { timeout: 20000 });
    await page.getByPlaceholder("Tìm kiếm pages...").waitFor({
      timeout: 20000,
    });

    console.log("✅ Dashboard layout verified");
  });
});

test.describe("Page Create", () => {
  test("should show field hints on form labels", async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/vi/pages/new`);
    await page.waitForTimeout(1000);

    // Should have hint icons (?)
    const hints = page.locator("text=?");
    const hintCount = await hints.count();
    expect(hintCount).toBeGreaterThanOrEqual(3); // title, slug, description

    // Hover on first hint — tooltip should appear
    const firstHint = hints.first();
    await firstHint.hover();
    await page.waitForTimeout(300);

    // Tooltip should be visible with text
    const tooltip = page.locator(".fixed.z-\\[9999\\]");
    await expect(tooltip).toBeVisible({ timeout: 3000 });

    console.log("✅ Field hints and tooltips verified");
  });

  test("should validate required fields", async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/vi/pages/new`);
    await page.waitForTimeout(1000);

    // Submit empty form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Should show validation errors
    const errors = page.locator(".text-destructive");
    const errorCount = await errors.count();
    expect(errorCount).toBeGreaterThanOrEqual(2); // title and slug required

    console.log("✅ Form validation verified");
  });
});
