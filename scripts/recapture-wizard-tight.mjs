/** Recapture wizard steps as tight main-element shots for the portfolio gallery. */
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:3100'
const OUT =
  '/Users/kennethrathbun/Documents/projects/ts-portfolio/src/assets/chavos-parlor'

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  reducedMotion: 'reduce',
})

async function hideDevtools() {
  await page.evaluate(() => {
    for (const img of document.querySelectorAll('img')) {
      if (!/tanstack/i.test(img.alt || '') && !/tanstack/i.test(img.src || ''))
        continue
      let el = img
      while (el && el !== document.body) {
        if (getComputedStyle(el).position === 'fixed') {
          el.style.display = 'none'
          break
        }
        el = el.parentElement
      }
    }
  })
}

const main = page.locator('main')

await page.goto(`${BASE}/book?step=service`, { waitUntil: 'load' })
await page.waitForTimeout(1000)
await hideDevtools()
await main.screenshot({ path: `${OUT}/wizard-service.png` })

await page.locator('main button').first().click()
await page
  .getByRole('button', { name: /next/i })
  .click({ timeout: 3000 })
  .catch(() => {})
await page.waitForURL(/step=time/, { timeout: 20_000 })
await page.waitForTimeout(3000)
await hideDevtools()
await main.screenshot({ path: `${OUT}/wizard-time.png` })

const serviceParam = new URL(page.url()).searchParams.get('service')
const slotDate = new Date(Date.now() + 7 * 24 * 3600 * 1000)
slotDate.setUTCHours(18, 0, 0, 0)
const slot = slotDate.toISOString().replace(/\.\d{3}Z$/, 'Z')
await page.goto(
  `${BASE}/book?step=details&service=${encodeURIComponent(
    serviceParam ?? '',
  )}&slot=${encodeURIComponent(slot)}`,
  { waitUntil: 'load' },
)
await page.waitForTimeout(1000)
await hideDevtools()
await main.screenshot({ path: `${OUT}/wizard-details.png` })

await browser.close()
console.log('done')
