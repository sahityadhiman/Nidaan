import { chromium } from 'playwright-core';
const OUT = process.argv[2] || '.';
const BASE = 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 460 }, deviceScaleFactor: 1 });
async function reset() { await page.goto(BASE, { waitUntil: 'domcontentloaded' }); await page.evaluate(() => localStorage.clear()); await page.goto(BASE, { waitUntil: 'networkidle' }); await page.waitForTimeout(1000); }
async function enterRole(name) { await page.locator('button', { hasText: name }).first().click(); await page.waitForTimeout(2000); }
try {
  for (const r of ['Municipal Official', 'Contractor', 'Citizen']) {
    await reset(); await enterRole(r);
    await page.screenshot({ path: `${OUT}/hdr-${r.split(' ')[0].toLowerCase()}.png`, fullPage: false });
    console.log('hdr', r);
  }
} finally { await browser.close(); }
