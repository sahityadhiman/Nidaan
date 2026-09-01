import { chromium } from 'playwright-core';

const OUT = process.argv[2] || '.';
const BASE = 'http://localhost:3000';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

async function reset() {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
}
async function enterRole(name) {
  await page.locator('button', { hasText: name }).first().click();
  await page.waitForTimeout(2200);
}
async function clickText(label) {
  await page.locator('button', { hasText: label }).first().click();
  await page.waitForTimeout(1700);
}

const shots = [
  ['landing', async () => { await reset(); }],
  ['official-overview', async () => { await reset(); await enterRole('Municipal Official'); }],
  ['official-agent', async () => { await clickText('Agent Activity'); }],
  ['official-pressure', async () => { await clickText('Pressure & Escalation'); }],
  ['citizen-voice', async () => { await reset(); await enterRole('Citizen'); await clickText('My Voice'); }],
  ['citizen-report', async () => { await clickText('Report an Issue'); }],
  ['contractor-jobs', async () => { await reset(); await enterRole('Contractor'); await clickText('Available Jobs'); }],
  ['contractor-earnings', async () => { await clickText('Earnings'); }],
];

try {
  for (const [name, fn] of shots) {
    try { await fn(); await page.screenshot({ path: `${OUT}/z-${name}.png`, fullPage: true }); console.log('shot', name); }
    catch (e) { console.error('FAIL', name, e.message); }
  }
  console.log('done');
} finally {
  await browser.close();
}
