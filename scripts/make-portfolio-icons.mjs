/** Renders the portfolio favicon/app icons (dark square, IBM Plex "K"). */
import { readFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const ROOT = '/Users/kennethrathbun/Documents/projects/ts-portfolio'
const sans700 = (
  await readFile(`${ROOT}/public/fonts/ibm-plex-sans-700.woff2`)
).toString('base64')

const html = (size) => `<!doctype html>
<html><head><style>
  @font-face { font-family: 'IBM Plex Sans'; font-weight: 700;
    src: url(data:font/woff2;base64,${sans700}) format('woff2'); }
  * { margin: 0; }
  body { width: ${size}px; height: ${size}px; }
  .tile {
    width: 100%; height: 100%;
    background: #101014;
    border-radius: ${Math.round(size * 0.14)}px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 700;
  }
  .k { color: #7ba3f7; font-size: ${Math.round(size * 0.62)}px; line-height: 1; }
</style></head>
<body><div class="tile"><span class="k">K</span></div></body></html>`

const browser = await chromium.launch()
const targets = [
  [32, `${ROOT}/public/favicon-32.png`],
  [180, `${ROOT}/public/apple-touch-icon.png`],
  [192, `${ROOT}/public/logo192.png`],
  [512, `${ROOT}/public/logo512.png`],
]
for (const [size, path] of targets) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
  })
  await page.setContent(html(size), { waitUntil: 'load' })
  await page.waitForTimeout(200)
  await page.screenshot({ path, omitBackground: true })
  await page.close()
}
await browser.close()
console.log('icons written')
