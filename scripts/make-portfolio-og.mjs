/** Renders the portfolio's 1200x630 OG card to ts-portfolio/public/og.png. */
import { readFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const FONTS = '/Users/kennethrathbun/Documents/projects/ts-portfolio/public/fonts'
const OUT = '/Users/kennethrathbun/Documents/projects/ts-portfolio/public/og.png'

const font = async (file) =>
  (await readFile(`${FONTS}/${file}`)).toString('base64')

const [sans700, sans500, mono400] = await Promise.all([
  font('ibm-plex-sans-700.woff2'),
  font('ibm-plex-sans-500.woff2'),
  font('ibm-plex-mono-400.woff2'),
])

const html = `<!doctype html>
<html>
<head>
<style>
  @font-face { font-family: 'IBM Plex Sans'; font-weight: 700;
    src: url(data:font/woff2;base64,${sans700}) format('woff2'); }
  @font-face { font-family: 'IBM Plex Sans'; font-weight: 500;
    src: url(data:font/woff2;base64,${sans500}) format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-weight: 400;
    src: url(data:font/woff2;base64,${mono400}) format('woff2'); }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px;
    background: #101014;
    color: #f4f4f5;
    font-family: 'IBM Plex Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(ellipse 85% 90% at 30% 10%, black 25%, transparent 78%);
  }
  .wrap { position: absolute; inset: 0; padding: 84px 92px; display: flex; flex-direction: column; justify-content: center; }
  .kicker { font-family: 'IBM Plex Mono', monospace; font-size: 26px; letter-spacing: 0.14em; text-transform: uppercase; color: #a1a1aa; }
  .kicker .brand { color: #7ba3f7; }
  h1 { font-size: 96px; font-weight: 700; letter-spacing: -0.02em; margin-top: 20px; }
  .role { font-size: 40px; font-weight: 500; margin-top: 18px; color: #d4d4d8; }
  .role .brand { color: #7ba3f7; }
  .bar { position: absolute; left: 92px; bottom: 84px; width: 120px; height: 6px; background: #7ba3f7; border-radius: 3px; }
  .tags { position: absolute; right: 92px; bottom: 76px; font-family: 'IBM Plex Mono', monospace; font-size: 22px; color: #71717a; }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="wrap">
    <div class="kicker"><span class="brand">$&nbsp;</span>whoami</div>
    <h1>Kenneth Rathbun</h1>
    <div class="role"><span class="brand">Full-stack developer.</span> I design and ship production web apps, end to end.</div>
  </div>
  <div class="bar"></div>
  <div class="tags">TypeScript · React 19 · TanStack Start</div>
</body>
</html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'load' })
await page.waitForTimeout(400)
await page.screenshot({ path: OUT })
await browser.close()
console.log('wrote', OUT)
