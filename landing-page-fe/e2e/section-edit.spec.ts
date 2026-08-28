import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const API_URL = 'http://localhost:3000';

async function login(page: any) {
  await page.goto(`${BASE_URL}/vi/login`);
  await page.fill('input[id="username"]', 'admin');
  await page.fill('input[id="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

async function getPageWithSections(): Promise<string | null> {
  const res = await fetch(`${API_URL}/pages`);
  const pages = await res.json();
  const pageWithSections = pages.find((p: any) => p.sections && p.sections.length > 0);
  return pageWithSections?.id || null;
}

test.describe('Section Edit Page', () => {
  test('should navigate from edit page to section edit via section card', async ({ page }) => {
    const pageId = await getPageWithSections();
    if (!pageId) {
      test.skip();
      return;
    }

    await login(page);

    // Go directly to the page edit
    await page.goto(`${BASE_URL}/vi/pages/${pageId}/edit`);
    await page.waitForTimeout(1000);

    // Look for section edit links
    const sectionEditLinks = page.locator('a[href*="/sections/"][href*="/edit"]');
    const sectionCount = await sectionEditLinks.count();
    console.log(`Found ${sectionCount} section edit links`);

    if (sectionCount === 0) {
      console.log('No sections found on this page');
      test.skip();
      return;
    }

    // Click edit on first section
    await sectionEditLinks.first().click();
    await page.waitForURL('**/sections/**/edit', { timeout: 10000 });

    // Verify section edit page layout
    const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumbs).toBeVisible();

    const title = page.locator('h1');
    await expect(title).toBeVisible();

    const previewBtn = page.locator('button', { hasText: /Preview|Xem trước/ });
    await expect(previewBtn).toBeVisible();

    const saveBtn = page.locator('button', { hasText: /Lưu|Save/ });
    await expect(saveBtn).toBeVisible();

    console.log('✅ All section edit page checks passed');
  });

  test('preview button opens modal', async ({ page }) => {
    const pageId = await getPageWithSections();
    if (!pageId) {
      test.skip();
      return;
    }

    await login(page);

    await page.goto(`${BASE_URL}/vi/pages/${pageId}/edit`);
    await page.waitForTimeout(1000);

    const sectionEditLinks = page.locator('a[href*="/sections/"][href*="/edit"]');
    const cnt = await sectionEditLinks.count();
    if (cnt === 0) {
      test.skip();
      return;
    }

    await sectionEditLinks.first().click();
    await page.waitForURL('**/sections/**/edit', { timeout: 10000 });

    // Click preview button
    const previewBtn = page.locator('button', { hasText: /Preview|Xem trước/ });
    await previewBtn.click();

    // Modal should open
    const modal = page.locator('[role="dialog"], .fixed.inset-0.z-50').first();
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Close modal
    const closeBtn = page.locator('[role="dialog"] button, .fixed.inset-0.z-50 button').first();
    await closeBtn.click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    console.log('✅ Preview modal opens and closes correctly');
  });

  test('should navigate from edit page to new section page', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/vi/pages`);
    await page.waitForTimeout(1000);

    const editLinks = page.locator('a[href*="/edit"]');
    if (await editLinks.count() === 0) {
      test.skip();
      return;
    }

    await editLinks.first().click();
    await page.waitForURL('**/edit', { timeout: 10000 });

    // Click "Add Section" button
    const addBtn = page.locator('a[href*="/sections/new"]').first();
    await addBtn.click();
    await page.waitForURL('**/sections/new', { timeout: 10000 });

    // Verify new section page
    const title = page.locator('h1');
    await expect(title).toContainText(/Thêm Section|Add Section/);

    const previewBtn = page.locator('button', { hasText: /Preview|Xem trước/ });
    await expect(previewBtn).toBeVisible();

    console.log('✅ New section page layout verified');
  });
});

test.describe('Dashboard', () => {
  test('should show stats cards and recent pages', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/vi/dashboard`);
    await page.waitForTimeout(1000);

    // Stats cards should be visible
    const statsCards = page.locator('.grid > div');
    const statsCount = await statsCards.count();
    expect(statsCount).toBeGreaterThanOrEqual(4);

    // Should have page title
    const title = page.locator('h1');
    await expect(title).toContainText(/Dashboard/);

    console.log('✅ Dashboard layout verified');
  });
});

test.describe('Page Create', () => {
  test('should show field hints on form labels', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/vi/pages/new`);
    await page.waitForTimeout(1000);

    // Should have hint icons (?)
    const hints = page.locator('text=?');
    const hintCount = await hints.count();
    expect(hintCount).toBeGreaterThanOrEqual(3); // title, slug, description

    // Hover on first hint — tooltip should appear
    const firstHint = hints.first();
    await firstHint.hover();
    await page.waitForTimeout(300);

    // Tooltip should be visible with text
    const tooltip = page.locator('.fixed.z-\\[9999\\]');
    await expect(tooltip).toBeVisible({ timeout: 3000 });

    console.log('✅ Field hints and tooltips verified');
  });

  test('should validate required fields', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/vi/pages/new`);
    await page.waitForTimeout(1000);

    // Submit empty form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Should show validation errors
    const errors = page.locator('.text-destructive');
    const errorCount = await errors.count();
    expect(errorCount).toBeGreaterThanOrEqual(2); // title and slug required

    console.log('✅ Form validation verified');
  });
});
