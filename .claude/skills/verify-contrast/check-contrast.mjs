#!/usr/bin/env node
/**
 * Measure real WCAG contrast for a component in this project, from an
 * actual rendered screenshot — not computed CSS values, not eyeballing.
 *
 * Why this exists: translucent/gradient/backdrop-filter backgrounds don't
 * have one "background color" to plug into a contrast calculator. The only
 * honest number comes from sampling the composited pixel behind the text a
 * browser actually paints. This script drives Chromium via Playwright,
 * locates the real text row inside the element (not a guessed padding
 * fraction), and reads pixel data back with sharp.
 *
 * Usage:
 *   node check-contrast.mjs \
 *     --url http://localhost:3061/ --selector '[data-variant="default"]' \
 *     [--nth 0] [--dark] [--state rest,hover,active,focus] [--x 0.06] \
 *     [--width 1280] [--height 1400] [--scan 20] \
 *     [--pre-eval "<js run in-page before measuring>"] [--wait 300]
 *
 * --scan N: instead of one fixed --x fraction, sample N evenly spaced x
 * positions across the element's width and report the WORST (lowest-
 * contrast) point per state. Use this for any backdrop that varies
 * spatially across the text run — a moving gradient/canvas behind a wide
 * span can pass comfortably at one x and fail badly a few characters over;
 * a single-point sample can miss that entirely.
 *
 * This file has no project-specific code — it's copy-paste portable to any
 * project with `playwright` and `sharp` as devDependencies. Anything a given
 * project needs before content is measurable (e.g. forcing a scroll-reveal
 * component visible, waiting for a font, dismissing a cookie banner) goes
 * through --pre-eval rather than being hardcoded here. See SKILL.md for this
 * project's actual invocation.
 *
 * Requires a dev server already running at --url.
 *
 * WCAG 2.x thresholds (AA): 4.5:1 normal text, 3:1 large text
 * (>=24px, or >=18.66px/14pt bold) and non-text UI components/graphics.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

function parseArgs(argv) {
	const args = {
		states: ["rest", "hover", "active", "focus"],
		nth: 0,
		x: 0.06,
		dark: false,
		wait: 300,
		width: 1280,
		height: 1400,
		scan: 0,
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--url") args.url = argv[++i];
		else if (a === "--selector") args.selector = argv[++i];
		else if (a === "--nth") args.nth = Number(argv[++i]);
		else if (a === "--x") args.x = Number(argv[++i]);
		else if (a === "--dark") args.dark = true;
		else if (a === "--state") args.states = argv[++i].split(",");
		else if (a === "--pre-eval") args.preEval = argv[++i];
		else if (a === "--wait") args.wait = Number(argv[++i]);
		else if (a === "--width") args.width = Number(argv[++i]);
		else if (a === "--height") args.height = Number(argv[++i]);
		else if (a === "--scan") args.scan = Number(argv[++i]);
	}
	if (!args.url || !args.selector) {
		console.error(
			"Usage: --url <dev-server-url> --selector <css-selector> [--nth N] [--dark] " +
				'[--state rest,hover,active,focus] [--x 0-1] [--pre-eval "<js>"] [--wait ms]',
		);
		process.exit(1);
	}
	return args;
}

function relLum([r, g, b]) {
	const lin = (c) => {
		c /= 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	const [rl, gl, bl] = [r, g, b].map(lin);
	return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}
function contrastRatio(a, b) {
	const l1 = relLum(a);
	const l2 = relLum(b);
	const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
	return (hi + 0.05) / (lo + 0.05);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const shotDir = await mkdtemp(join(tmpdir(), "verify-contrast-"));

	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: args.width, height: args.height } });
	await page.goto(args.url, { waitUntil: "load" });

	// Project-specific setup (scroll-reveal, cookie banners, fonts, etc.)
	// goes through this hook — nothing project-specific is hardcoded here.
	if (args.preEval) {
		await page.evaluate(args.preEval);
	}
	if (args.dark) {
		await page.evaluate(() => document.documentElement.classList.add("dark"));
	}
	await page.waitForTimeout(args.wait);

	const el = page.locator(args.selector).nth(args.nth);
	await el.scrollIntoViewIfNeeded();
	const box = await el.boundingBox();
	if (!box) throw new Error(`Element not visible: ${args.selector} [${args.nth}]`);

	// Text color, resolved to sRGB bytes via a real <canvas> in-page (handles
	// oklch/oklab/color-mix() computed values, not just rgb()).
	const textColor = await el.evaluate((node) => {
		const cs = getComputedStyle(node);
		const canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		const ctx = canvas.getContext("2d");
		ctx.fillStyle = cs.color;
		ctx.fillRect(0, 0, 1, 1);
		return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3));
	});

	// Locate the actual glyph row (not a guessed padding fraction) — matters
	// for fixed-height, flex-centered buttons where text sits at ~50%, or for
	// multi-line content where a single fraction doesn't generalize.
	const glyphBox = await el.evaluate((node) => {
		const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
		let text;
		while ((text = walker.nextNode())) if (text.textContent.trim().length > 0) break;
		if (!text) return null;
		const range = document.createRange();
		range.selectNodeContents(text);
		const r = range.getBoundingClientRect();
		return { top: r.top, bottom: r.bottom };
	});
	const yFrac = glyphBox ? ((glyphBox.top + glyphBox.bottom) / 2 - box.y) / box.height : 0.5;

	const label = (await el.innerText()).trim().slice(0, 40);
	console.log(`Element: "${label}" — text color rgb(${textColor.join(",")}), glyph row at yFrac=${yFrac.toFixed(2)}\n`);

	const results = [];
	for (const state of args.states) {
		if (state === "rest") {
			await page.mouse.move(0, 0);
			await el.blur().catch(() => {});
		} else if (state === "hover") {
			await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		} else if (state === "focus") {
			await page.mouse.move(0, 0);
			await el.focus();
		} else if (state === "active") {
			await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
			await page.mouse.down();
		}
		await page.waitForTimeout(150);

		// Sampling a fixed x-fraction can land squarely on glyph ink rather than
		// the backdrop behind it — reliably true for elements with no leading
		// padding before the text starts (e.g. a bare inline <span>, unlike a
		// padded button where x=0.06 lands ahead of the label). Hiding the
		// element's own text color for just this screenshot removes the ink
		// without touching layout, backgrounds, or state-driven styling, so the
		// sampled pixel is always the real composited backdrop — the textColor
		// used for the actual contrast math was already resolved above, before
		// this override.
		await el.evaluate((node) => {
			node.dataset.contrastProbeColor = node.style.color;
			node.style.color = "transparent";
		});
		const file = join(shotDir, `${state}.png`);
		await el.screenshot({ path: file });
		await el.evaluate((node) => {
			node.style.color = node.dataset.contrastProbeColor ?? "";
			delete node.dataset.contrastProbeColor;
		});

		if (state === "active") {
			// Release away from the element so mouseup doesn't land on it —
			// releasing in place would fire a real click (and navigate if
			// the button wraps a link), which corrupts every state after it.
			await page.mouse.move(5, 5);
			await page.mouse.up();
			// The move-while-down above is, mechanically, a text-selection
			// drag from the element to the release point. Over ordinary
			// (non-text) UI this is invisible, but if the element sits near
			// selectable text, the browser's native ::selection highlight
			// lingers and can visibly tint whatever's sampled in every state
			// captured afterwards — a pure test-harness artifact, not a real
			// CSS state. Clear it so later states reflect actual styling.
			await page.evaluate(() => window.getSelection()?.removeAllRanges());
		}

		const img = sharp(file);
		const { width, height } = await img.metadata();
		const raw = await img.raw().ensureAlpha().toBuffer();
		const y = Math.min(height - 1, Math.max(0, Math.round(height * yFrac)));

		const xFracs = args.scan > 0
			? Array.from({ length: args.scan }, (_, i) => 0.03 + (i * 0.94) / Math.max(1, args.scan - 1))
			: [args.x];

		let worst = null;
		for (const xFrac of xFracs) {
			const x = Math.min(width - 1, Math.max(0, Math.round(width * xFrac)));
			const idx = (y * width + x) * 4;
			const bg = [raw[idx], raw[idx + 1], raw[idx + 2]];
			const ratio = contrastRatio(textColor, bg);
			if (!worst || ratio < worst.ratio) worst = { bg, ratio, xFrac };
		}
		results.push({ state, bg: worst.bg, ratio: worst.ratio, xFrac: worst.xFrac });
	}

	const header = args.scan > 0
		? "state    bg-pixel          contrast  AA-normal(4.5)  AA-large/UI(3.0)  worst-x"
		: "state    bg-pixel          contrast  AA-normal(4.5)  AA-large/UI(3.0)";
	console.log(header);
	for (const r of results) {
		const bgStr = `rgb(${r.bg.join(",")})`.padEnd(18);
		const pass45 = r.ratio >= 4.5 ? "PASS" : "FAIL";
		const pass30 = r.ratio >= 3.0 ? "PASS" : "FAIL";
		const worstX = args.scan > 0 ? `  ${r.xFrac.toFixed(2)}` : "";
		console.log(`${r.state.padEnd(8)} ${bgStr} ${r.ratio.toFixed(2).padStart(6)}:1   ${pass45.padEnd(14)}  ${pass30}${worstX}`);
	}
	const worst = results.reduce((a, b) => (a.ratio < b.ratio ? a : b));
	console.log(`\nWorst case: ${worst.state} at ${worst.ratio.toFixed(2)}:1`);
	console.log(`Screenshots: ${shotDir}`);

	await browser.close();
	if (worst.ratio < 4.5) process.exitCode = 1;
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
