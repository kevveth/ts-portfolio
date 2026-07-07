/** Temp: screenshot the portfolio dev server pages for a visual review. */
import { chromium } from '@playwright/test'

const BASE = process.env.PORTFOLIO_BASE ?? 'http://localhost:3004'
const OUT = process.env.PREVIEW_OUT ?? '/tmp/portfolio-preview'
const { mkdir } = await import('node:fs/promises')
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()

for (const scheme of ['dark', 'light']) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    colorScheme: scheme,
    reducedMotion: 'reduce',
  })
  await page.goto(`${BASE}/`, { waitUntil: 'load' })
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/home-${scheme}.png`, fullPage: true })
  await page.goto(`${BASE}/projects/chavos-parlor`, { waitUntil: 'load' })
  await page.waitForTimeout(900)
  await page.screenshot({
    path: `${OUT}/detail-${scheme}.png`,
    fullPage: true,
  })
  if (scheme === 'dark') {
    await page.goto(`${BASE}/projects`, { waitUntil: 'load' })
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${OUT}/projects-dark.png`, fullPage: true })
  }
  await page.close()
}

await browser.close()
console.log('previews →', OUT)
