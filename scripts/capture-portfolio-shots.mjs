/**
 * One-off: capture clean UI screenshots of the running app for Kenneth's
 * portfolio case study (ts-portfolio repo).
 *
 * Usage:
 *   BOOKING_MODE=internal pnpm exec vite dev --port 3100   # in one shell
 *   node scripts/capture-portfolio-shots.mjs               # in another
 *
 * Writes PNGs into ts-portfolio/src/assets/chavos-parlor/.
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:3100'
const OUT =
  '/Users/kennethrathbun/Documents/projects/ts-portfolio/src/assets/chavos-parlor'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  reducedMotion: 'reduce',
})

const shot = (name) => `${OUT}/${name}.png`

/** Hide the dev-only TanStack devtools trigger bubble before screenshots. */
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

// --- Landing page ---
await page.goto(`${BASE}/`, { waitUntil: 'load' })
await page.waitForTimeout(800) // fonts/images settle
await hideDevtools()
await page.screenshot({ path: shot('hero') })

const services = page.locator('section:has(#services-heading)')
await services.scrollIntoViewIfNeeded()
await page.waitForTimeout(600)
await services.screenshot({ path: shot('services') })

const gallery = page.locator('section:has(#gallery-heading)')
await gallery.scrollIntoViewIfNeeded()
await page.waitForTimeout(1200) // lazy images
await gallery.screenshot({ path: shot('gallery') })

// --- Booking wizard ---
await page.goto(`${BASE}/book`, { waitUntil: 'load' })
await page.waitForTimeout(800)
await hideDevtools()
console.log('wizard service-step url:', page.url())
await page.screenshot({ path: shot('wizard-service') })

// Select the first service row, then advance (row click may only select;
// the Next button advances — tolerate either interaction model).
await page.locator('main button').first().click()
await page
  .getByRole('button', { name: /next/i })
  .click({ timeout: 3000 })
  .catch(() => {})
await page.waitForURL(/step=time/, { timeout: 20_000 })
await page.waitForTimeout(3000) // availability fetch
await hideDevtools()
console.log('wizard time-step url:', page.url())
await page.screenshot({ path: shot('wizard-time') })

// Details step: deep-link with the service from the URL and a well-formed
// UTC slot (the step validates slot syntax, not live availability).
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
await page.waitForTimeout(800)
await hideDevtools()
console.log('wizard details-step url:', page.url())
await page.screenshot({ path: shot('wizard-details') })

await browser.close()
console.log('done →', OUT)
