import { test, expect } from '@playwright/test';

test.describe('Performance - Core Web Vitals', () => {
  test('public page loads within performance budget', async ({ page }) => {
    // Navigate and measure performance
    const startTime = Date.now();

    const response = await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    // Response should succeed
    expect(response?.status()).toBe(200);

    // Measure Core Web Vitals via Performance API
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      const fcp = paint.find((p) => p.name === 'first-contentful-paint');

      return {
        // Navigation timing
        dns: nav.domainLookupEnd - nav.domainLookupStart,
        connect: nav.connectEnd - nav.connectStart,
        ttfb: nav.responseStart - nav.requestStart,
        download: nav.responseEnd - nav.responseStart,
        domInteractive: nav.domInteractive - nav.startTime,
        domComplete: nav.domComplete - nav.startTime,
        loadEvent: nav.loadEventEnd - nav.startTime,

        // Paint timing
        fcp: fcp?.startTime || 0,

        // Page info
        title: document.title,
        url: window.location.href,
      };
    });

    console.log('\n=== Performance Metrics ===');
    console.log(`URL: ${metrics.url}`);
    console.log(`Title: ${metrics.title}`);
    console.log(`Total load time: ${loadTime}ms`);
    console.log(`TTFB: ${metrics.ttfb}ms`);
    console.log(`FCP: ${metrics.fcp}ms`);
    console.log(`DOM Interactive: ${metrics.domInteractive}ms`);
    console.log(`DOM Complete: ${metrics.domComplete}ms`);
    console.log(`Load Event: ${metrics.loadEvent}ms`);
    console.log(`DNS: ${metrics.dns}ms`);
    console.log(`Connect: ${metrics.connect}ms`);
    console.log(`Download: ${metrics.download}ms`);
    console.log('===========================\n');

    // Performance budgets
    expect(metrics.ttfb).toBeLessThan(800);  // TTFB < 800ms
    expect(metrics.fcp).toBeLessThan(1800);  // FCP < 1.8s
    expect(metrics.domComplete).toBeLessThan(3000);  // DOM Complete < 3s
    expect(loadTime).toBeLessThan(5000);  // Total < 5s
  });

  test('admin pages load within budget', async ({ page }) => {
    const startTime = Date.now();

    const response = await page.goto('/vi/login', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    expect(response?.status()).toBe(200);

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find((p) => p.name === 'first-contentful-paint');

      return {
        ttfb: nav.responseStart - nav.requestStart,
        fcp: fcp?.startTime || 0,
        domComplete: nav.domComplete - nav.startTime,
        loadEvent: nav.loadEventEnd - nav.startTime,
        url: window.location.href,
      };
    });

    console.log('\n=== Login Page Metrics ===');
    console.log(`URL: ${metrics.url}`);
    console.log(`TTFB: ${metrics.ttfb}ms`);
    console.log(`FCP: ${metrics.fcp}ms`);
    console.log(`DOM Complete: ${metrics.domComplete}ms`);
    console.log(`Load Event: ${metrics.loadEvent}ms`);
    console.log(`Total: ${loadTime}ms`);
    console.log('==========================\n');

    expect(metrics.ttfb).toBeLessThan(800);
    expect(metrics.fcp).toBeLessThan(1800);
    expect(loadTime).toBeLessThan(5000);
  });

  test('measure LCP via PerformanceObserver', async ({ page }) => {
    // Inject LCP observer before navigation
    await page.addInitScript(() => {
      (window as any).__lcp = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        (window as any).__lcp = lastEntry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });

    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    // Wait a bit for LCP to be recorded
    await page.waitForTimeout(1000);

    const lcp = await page.evaluate(() => (window as any).__lcp || 0);

    console.log('\n=== LCP Metrics ===');
    console.log(`LCP: ${lcp}ms`);
    console.log(`Total load: ${loadTime}ms`);
    console.log('===================\n');

    expect(lcp).toBeLessThan(2500);  // LCP < 2.5s (Good)
    expect(loadTime).toBeLessThan(5000);
  });
});
