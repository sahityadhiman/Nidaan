import { chromium } from 'playwright-core';

const OUT = process.argv[2] || '.';
const BASE = 'http://localhost:3000';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });

async function reset() {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
}
async function enterRole(name) { await page.locator('button', { hasText: name }).first().click(); await page.waitForTimeout(2000); }
async function clickText(label) { await page.locator('button', { hasText: label }).first().click(); await page.waitForTimeout(1500); }

try {
  // Contractor jobs — hover the 2nd job card
  await reset();
  await enterRole('Contractor');
  await clickText('Available Jobs');
  const cards = page.locator('.glass-zone .glass-panel');
  const target = cards.nth(1);
  await target.scrollIntoViewIfNeeded();
  await target.hover();
  await page.waitForTimeout(600); // let the transition settle
  await page.screenshot({ path: `${OUT}/hover-contractor.png`, fullPage: false });

  // Landing — hover a role card
  await reset();
  const roleCard = page.locator('.frost .glass-panel-interactive').nth(1);
  await roleCard.scrollIntoViewIfNeeded();
  await roleCard.hover();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/hover-landing.png`, fullPage: false });

  console.log('hover shots done');
} catch (e) {
  console.error('HOVER_ERR', e.message);
} finally {
  await browser.close();
}
