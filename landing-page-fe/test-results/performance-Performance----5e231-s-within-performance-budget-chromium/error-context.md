# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: performance.spec.ts >> Performance - Core Web Vitals >> public page loads within performance budget
- Location: e2e\performance.spec.ts:4:7

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 1800
Received:   8780
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]: Đăng nhập
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Username
        - textbox "Username" [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e12]: Password
        - textbox "Password" [ref=e13]
      - button "Đăng nhập" [ref=e14]
  - region "Notifications alt+T"
  - alert [ref=e15]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Performance - Core Web Vitals', () => {
  4   |   test('public page loads within performance budget', async ({ page }) => {
  5   |     // Navigate and measure performance
  6   |     const startTime = Date.now();
  7   | 
  8   |     const response = await page.goto('/', { waitUntil: 'networkidle' });
  9   |     const loadTime = Date.now() - startTime;
  10  | 
  11  |     // Response should succeed
  12  |     expect(response?.status()).toBe(200);
  13  | 
  14  |     // Measure Core Web Vitals via Performance API
  15  |     const metrics = await page.evaluate(() => {
  16  |       const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  17  |       const paint = performance.getEntriesByType('paint');
  18  | 
  19  |       const fcp = paint.find((p) => p.name === 'first-contentful-paint');
  20  | 
  21  |       return {
  22  |         // Navigation timing
  23  |         dns: nav.domainLookupEnd - nav.domainLookupStart,
  24  |         connect: nav.connectEnd - nav.connectStart,
  25  |         ttfb: nav.responseStart - nav.requestStart,
  26  |         download: nav.responseEnd - nav.responseStart,
  27  |         domInteractive: nav.domInteractive - nav.startTime,
  28  |         domComplete: nav.domComplete - nav.startTime,
  29  |         loadEvent: nav.loadEventEnd - nav.startTime,
  30  | 
  31  |         // Paint timing
  32  |         fcp: fcp?.startTime || 0,
  33  | 
  34  |         // Page info
  35  |         title: document.title,
  36  |         url: window.location.href,
  37  |       };
  38  |     });
  39  | 
  40  |     console.log('\n=== Performance Metrics ===');
  41  |     console.log(`URL: ${metrics.url}`);
  42  |     console.log(`Title: ${metrics.title}`);
  43  |     console.log(`Total load time: ${loadTime}ms`);
  44  |     console.log(`TTFB: ${metrics.ttfb}ms`);
  45  |     console.log(`FCP: ${metrics.fcp}ms`);
  46  |     console.log(`DOM Interactive: ${metrics.domInteractive}ms`);
  47  |     console.log(`DOM Complete: ${metrics.domComplete}ms`);
  48  |     console.log(`Load Event: ${metrics.loadEvent}ms`);
  49  |     console.log(`DNS: ${metrics.dns}ms`);
  50  |     console.log(`Connect: ${metrics.connect}ms`);
  51  |     console.log(`Download: ${metrics.download}ms`);
  52  |     console.log('===========================\n');
  53  | 
  54  |     // Performance budgets
  55  |     expect(metrics.ttfb).toBeLessThan(800);  // TTFB < 800ms
> 56  |     expect(metrics.fcp).toBeLessThan(1800);  // FCP < 1.8s
      |                         ^ Error: expect(received).toBeLessThan(expected)
  57  |     expect(metrics.domComplete).toBeLessThan(3000);  // DOM Complete < 3s
  58  |     expect(loadTime).toBeLessThan(5000);  // Total < 5s
  59  |   });
  60  | 
  61  |   test('admin pages load within budget', async ({ page }) => {
  62  |     const startTime = Date.now();
  63  | 
  64  |     const response = await page.goto('/vi/login', { waitUntil: 'networkidle' });
  65  |     const loadTime = Date.now() - startTime;
  66  | 
  67  |     expect(response?.status()).toBe(200);
  68  | 
  69  |     const metrics = await page.evaluate(() => {
  70  |       const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  71  |       const paint = performance.getEntriesByType('paint');
  72  |       const fcp = paint.find((p) => p.name === 'first-contentful-paint');
  73  | 
  74  |       return {
  75  |         ttfb: nav.responseStart - nav.requestStart,
  76  |         fcp: fcp?.startTime || 0,
  77  |         domComplete: nav.domComplete - nav.startTime,
  78  |         loadEvent: nav.loadEventEnd - nav.startTime,
  79  |         url: window.location.href,
  80  |       };
  81  |     });
  82  | 
  83  |     console.log('\n=== Login Page Metrics ===');
  84  |     console.log(`URL: ${metrics.url}`);
  85  |     console.log(`TTFB: ${metrics.ttfb}ms`);
  86  |     console.log(`FCP: ${metrics.fcp}ms`);
  87  |     console.log(`DOM Complete: ${metrics.domComplete}ms`);
  88  |     console.log(`Load Event: ${metrics.loadEvent}ms`);
  89  |     console.log(`Total: ${loadTime}ms`);
  90  |     console.log('==========================\n');
  91  | 
  92  |     expect(metrics.ttfb).toBeLessThan(800);
  93  |     expect(metrics.fcp).toBeLessThan(1800);
  94  |     expect(loadTime).toBeLessThan(5000);
  95  |   });
  96  | 
  97  |   test('measure LCP via PerformanceObserver', async ({ page }) => {
  98  |     // Inject LCP observer before navigation
  99  |     await page.addInitScript(() => {
  100 |       (window as any).__lcp = 0;
  101 |       new PerformanceObserver((entryList) => {
  102 |         const entries = entryList.getEntries();
  103 |         const lastEntry = entries[entries.length - 1];
  104 |         (window as any).__lcp = lastEntry.startTime;
  105 |       }).observe({ type: 'largest-contentful-paint', buffered: true });
  106 |     });
  107 | 
  108 |     const startTime = Date.now();
  109 |     await page.goto('/', { waitUntil: 'networkidle' });
  110 |     const loadTime = Date.now() - startTime;
  111 | 
  112 |     // Wait a bit for LCP to be recorded
  113 |     await page.waitForTimeout(1000);
  114 | 
  115 |     const lcp = await page.evaluate(() => (window as any).__lcp || 0);
  116 | 
  117 |     console.log('\n=== LCP Metrics ===');
  118 |     console.log(`LCP: ${lcp}ms`);
  119 |     console.log(`Total load: ${loadTime}ms`);
  120 |     console.log('===================\n');
  121 | 
  122 |     expect(lcp).toBeLessThan(2500);  // LCP < 2.5s (Good)
  123 |     expect(loadTime).toBeLessThan(5000);
  124 |   });
  125 | });
  126 | 
```