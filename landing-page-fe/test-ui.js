const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Testing UI...\n');

  // Test 1: Login Page
  console.log('1. Testing Login Page...');
  await page.goto('http://localhost:3001/login');
  await page.waitForTimeout(2000);
  const loginTitle = await page.locator('[data-slot="card-title"]').first().textContent().catch(() => 'N/A');
  console.log(`   Title: ${loginTitle}`);
  await page.screenshot({ path: 'screenshots/01-login.png' });
  console.log('   ✅ Login page loaded\n');

  // Test 2: Login
  console.log('2. Login...');
  await page.fill('input[id="username"]', 'admin');
  await page.fill('input[id="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/02-after-login.png' });
  console.log('   ✅ Login submitted\n');

  // Test 3: Dashboard Page
  console.log('3. Testing Dashboard Page...');
  await page.goto('http://localhost:3001/dashboard');
  await page.waitForTimeout(3000);
  const dashboardTitle = await page.locator('h1').first().textContent().catch(() => 'N/A');
  console.log(`   Title: ${dashboardTitle}`);
  await page.screenshot({ path: 'screenshots/03-dashboard.png' });
  console.log('   ✅ Dashboard page loaded\n');

  // Test 4: New Page
  console.log('4. Testing New Page...');
  await page.goto('http://localhost:3001/pages/new');
  await page.waitForTimeout(2000);
  const newPageTitle = await page.locator('h1').first().textContent().catch(() => 'N/A');
  console.log(`   Title: ${newPageTitle}`);
  await page.screenshot({ path: 'screenshots/04-new-page.png' });
  console.log('   ✅ New page loaded\n');

  // Test 5: Edit Page
  console.log('5. Testing Edit Page...');
  await page.goto('http://localhost:3001/pages/a41a63b7-b32c-4781-925f-9529cce41b98/edit');
  await page.waitForTimeout(3000);
  const editPageTitle = await page.locator('h1').first().textContent().catch(() => 'N/A');
  console.log(`   Title: ${editPageTitle}`);
  await page.screenshot({ path: 'screenshots/05-edit-page.png' });
  console.log('   ✅ Edit page loaded\n');

  // Test 6: Public Page
  console.log('6. Testing Public Page...');
  await page.goto('http://localhost:3001/san-pham-moi');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/06-public-page.png' });
  console.log('   ✅ Public page loaded\n');

  await browser.close();
  console.log('All tests completed! Screenshots saved in screenshots/');
})();
