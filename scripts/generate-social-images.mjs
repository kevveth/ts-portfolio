import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
// Reuse the image pipeline already installed for Vite; no new dependency.
const require = createRequire(import.meta.resolve('vite-imagetools'));
const sharp = require('sharp');
const root = new URL('../', import.meta.url);
const at = path => new URL(path, root);
const svg = content => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f5f5f2"/>${content}</svg>`);
await mkdir(at('public/og/'), { recursive: true });
await sharp(svg(`
<rect x="88" y="150" width="870" height="110" fill="#007a4b"/>
<text x="110" y="232" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="80" font-weight="800" font-style="italic" letter-spacing="-3">kenneth rathbun</text>
<g fill="#161616" font-family="monospace" font-size="24">
<text x="88" y="324">developer / skateboarder / barista</text>
<text x="88" y="472">work</text><text x="220" y="472">about</text><text x="366" y="472">contact</text>
</g>`)).png().toFile(at('public/og.png').pathname);
// Crop only the documented capture, never fabricate or redraw the client site.
const capture = await sharp(at('src/assets/chavos-parlor/production-desktop.png').pathname)
  .extract({left:0, top:0, width:1280, height:880})
  .resize(624,429).png().toBuffer();
await sharp(svg(`
<rect x="64" y="72" width="448" height="60" fill="#007a4b"/>
<text x="80" y="115" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="800" font-style="italic" letter-spacing="-1">kenneth rathbun</text>
<g fill="#161616" font-family="monospace">
<text x="64" y="238" font-size="35">Chavo’s Parlor</text>
<text x="64" y="290" font-size="21">design &amp; development</text>
<text x="64" y="548" font-size="17">Production capture</text>
<text x="64" y="578" font-size="17">October 26, 2026</text>
</g>`)).composite([{input:capture,left:552,top:144}]).jpeg({quality:92}).toFile(at('public/og/chavos-parlor.jpg').pathname);
