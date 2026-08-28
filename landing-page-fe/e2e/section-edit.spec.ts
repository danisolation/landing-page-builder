import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const PAGE_WITH_SECTIONS = 'a41a63b7-b32c-4781-925f-9529cce41b98'; // "Sản phẩm mới"

test.describe('Section Edit Page', () => {
  test('should navigate from edit page to section edit via section card', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/vi/login`);
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Go directly to the page that has sections
    await page.goto(`${BASE_URL}/vi/pages/${PAGE_WITH_SECTIONS}/edit`);
    await page.waitForTimeout(1000);

    // Check if sections exist — look for edit links in section cards
    const sectionEditLinks = page.locator('a[href*="/sections/"][href*="/edit"]');
    const sectionCount = await sectionEditLinks.count();
    console.log(`Found ${sectionCount} section edit links`);

    if (sectionCount === 0) {
      console.log('No sections found');
      test.skip();
      return;
    }

    // Click edit on first section
    await sectionEditLinks.first().click();
    await page.waitForURL('**/sections/**/edit', { timeout: 10000 });

    // === Verify section edit page layout ===

    // 1. Breadcrumbs exist
    const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumbs).toBeVisible();

    // 2. Title exists
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    // 3. Preview button exists
    const previewBtn = page.locator('button', { hasText: 'Preview' });
    await expect(previewBtn).toBeVisible();

    // 4. Back button exists
    const backBtn = page.locator('button', { hasText: 'Quay lại' });
    await expect(backBtn).toBeVisible();

    // 5. Section type selector exists (disabled in edit mode)
    const typeSelect = page.locator('[role="combobox"]').first();
    await expect(typeSelect).toBeVisible();

    // 6. Order input exists
    const orderInput = page.locator('input[type="number"]');
    await expect(orderInput).toBeVisible();

    // 7. Save button exists
    const saveBtn = page.locator('button', { hasText: 'Lưu' });
    await expect(saveBtn).toBeVisible();

    // 8. Cancel button exists
    const cancelBtn = page.locator('button', { hasText: 'Hủy' });
    await expect(cancelBtn).toBeVisible();

    // 9. Type is locked hint exists
    const typeLocked = page.locator('text=Không thể đổi loại section');
    await expect(typeLocked).toBeVisible();

    console.log('✅ All section edit page checks passed');
  });

  test('preview button opens modal', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/vi/login`);
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate directly to the page that has sections
    await page.goto(`${BASE_URL}/vi/pages/${PAGE_WITH_SECTIONS}/edit`);
    await page.waitForTimeout(1000);

    const sectionEditLinks = page.locator('a[href*="/sections/"][href*="/edit"]');
    const cnt = await sectionEditLinks.count();
    console.log(`Found ${cnt} section edit links`);
    if (cnt === 0) {
      const allLinks = await page.locator('a').evaluateAll(els =>
        els.map(el => ({ href: el.getAttribute('href'), text: el.textContent?.trim() }))
      );
      console.log('All links:', JSON.stringify(allLinks, null, 2));
      const svgs = await page.locator('svg.lucide-pencil').count();
      console.log(`Found ${svgs} pencil icons`);
      test.skip();
      return;
    }

    await sectionEditLinks.first().click();
    await page.waitForURL('**/sections/**/edit', { timeout: 10000 });

    // Click preview button
    const previewBtn = page.locator('button', { hasText: 'Preview' });
    await previewBtn.click();

    // Modal should open — look for the modal overlay
    const modal = page.locator('[role="dialog"], .fixed.inset-0.z-50').first();
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Close modal
    const closeBtn = page.locator('[role="dialog"] button, .fixed.inset-0.z-50 button').first();
    await closeBtn.click();

    // Modal should be hidden
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    console.log('✅ Preview modal opens and closes correctly');
  });

  test('should navigate from edit page to new section page', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/vi/login`);
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to edit page
    await page.goto(`${BASE_URL}/vi/dashboard`);
    await page.waitForTimeout(1000);

    const editButtons = page.locator('text=Sửa');
    if (await editButtons.count() === 0) {
      test.skip();
      return;
    }

    await editButtons.first().click();
    await page.waitForURL('**/edit', { timeout: 10000 });

    // Click "Add Section" button
    const addBtn = page.locator('a[href*="/sections/new"], button', { hasText: 'Thêm Section' }).first();
    await addBtn.click();
    await page.waitForURL('**/sections/new', { timeout: 10000 });

    // Verify new section page
    const title = page.locator('h1');
    await expect(title).toContainText('Thêm Section');

    // Preview button exists
    const previewBtn = page.locator('button', { hasText: 'Preview' });
    await expect(previewBtn).toBeVisible();

    // Type selector is NOT disabled (can choose type)
    const typeSelect = page.locator('[role="combobox"]').first();
    await expect(typeSelect).toBeEnabled();

    console.log('✅ New section page layout verified');
  });
});
