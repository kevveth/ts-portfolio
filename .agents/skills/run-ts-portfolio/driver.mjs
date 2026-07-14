// REPL driver for ts-portfolio (TanStack Start SSR web app).
// Drives a headless Chromium against a running `vite dev` server.
// Designed for agents: wrap in tmux, send-keys commands, capture-pane output.
import { chromium } from "playwright";
import * as readline from "node:readline";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE = process.env.PORTFOLIO_BASE ?? "http://localhost:3050";
const SHOT_DIR = process.env.SCREENSHOT_DIR || "/tmp/portfolio-shots";
fs.mkdirSync(SHOT_DIR, { recursive: true });

let browser = null;
let page = null;
const consoleMsgs = [];

const COMMANDS = {
	async launch() {
		if (browser) return console.log("already launched");
		browser = await chromium.launch({ args: ["--no-sandbox"] });
		// reducedMotion:'reduce' is required — Reveal (src/components/reveal.tsx)
		// keeps sections at opacity:0 until an IntersectionObserver fires, so a
		// plain screenshot right after goto() shows an empty page below the header.
		page = await browser.newPage({
			viewport: { width: 1280, height: 900 },
			reducedMotion: "reduce",
		});
		page.on("console", (msg) => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`));
		console.log("launched. base:", BASE);
	},

	async nav(urlPath) {
		if (!page) return console.log("ERROR: launch first");
		const url = /^https?:\/\//.test(urlPath || "") ? urlPath : `${BASE}${urlPath || "/"}`;
		await page.goto(url, { waitUntil: "load" });
		console.log("nav →", url);
	},

	async ss(name) {
		if (!page) return console.log("ERROR: launch first");
		const f = path.join(SHOT_DIR, `${name || `ss-${Date.now()}`}.png`);
		await page.screenshot({ path: f, fullPage: true });
		console.log("screenshot:", f);
	},

	"screenshot-element": async (arg) => {
		if (!page) return console.log("ERROR: launch first");
		const [sel, name] = arg.split("|").map((s) => s.trim());
		const f = path.join(SHOT_DIR, `${name || `ss-${Date.now()}`}.png`);
		await page.locator(sel).first().screenshot({ path: f });
		console.log("screenshot:", f);
	},

	async click(sel) {
		if (!page) return console.log("ERROR: launch first");
		try {
			await page.locator(sel).first().click({ timeout: 5000 });
			console.log("click", sel, "→ OK");
		} catch (e) {
			console.log("click", sel, "→ ERROR:", e.message.split("\n")[0]);
		}
	},

	"click-text": async (text) => {
		if (!page) return console.log("ERROR: launch first");
		try {
			await page.getByText(text, { exact: false }).first().click({ timeout: 5000 });
			console.log("click-text", JSON.stringify(text), "→ OK");
		} catch (e) {
			console.log("click-text", JSON.stringify(text), "→ ERROR:", e.message.split("\n")[0]);
		}
	},

	async fill(arg) {
		if (!page) return console.log("ERROR: launch first");
		const [sel, ...rest] = arg.split(" ");
		await page.locator(sel).first().fill(rest.join(" "));
		console.log("fill", sel, "→ OK");
	},

	async type(text) {
		if (page) await page.keyboard.type(text, { delay: 20 });
	},
	async press(key) {
		if (page) await page.keyboard.press(key);
	},

	async wait(sel) {
		if (!page) return console.log("ERROR: launch first");
		try {
			await page.locator(sel).first().waitFor({ timeout: 10_000 });
			console.log("found:", sel);
		} catch {
			console.log("TIMEOUT:", sel);
		}
	},

	async eval(expr) {
		if (!page) return console.log("ERROR: launch first");
		try {
			console.log(JSON.stringify(await page.evaluate(expr)));
		} catch (e) {
			console.log("ERROR:", e.message);
		}
	},

	async text(sel) {
		if (!page) return console.log("ERROR: launch first");
		console.log(
			await page.evaluate(
				(s) => (s ? document.querySelector(s) : document.body)?.innerText ?? "(null)",
				sel || null,
			),
		);
	},

	async html(sel) {
		if (!page) return console.log("ERROR: launch first");
		console.log(await page.locator(sel).first().innerHTML());
	},

	// prints collected console messages since launch (or since last `console-clear`)
	console() {
		if (consoleMsgs.length === 0) return console.log("(no console output)");
		for (const m of consoleMsgs) console.log(m);
	},
	"console-errors": () => {
		const errs = consoleMsgs.filter((m) => m.startsWith("[error]"));
		console.log(errs.length === 0 ? "(no console errors)" : errs.join("\n"));
	},
	"console-clear": () => {
		consoleMsgs.length = 0;
		console.log("cleared");
	},

	async quit() {
		if (browser) await browser.close().catch(() => {});
		browser = null;
		page = null;
	},
	help() {
		console.log("commands:", Object.keys(COMMANDS).join(", "));
	},
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "driver> " });

// When stdin is piped (non-interactive heredoc), readline fires every 'line'
// event synchronously in one tick — an async handler alone lets commands race
// each other (e.g. `nav` starting before `launch` finishes). Queue instead.
const queue = [];
let draining = false;
let drainDone = Promise.resolve();

async function drain() {
	if (draining) return;
	draining = true;
	let resolveDone;
	drainDone = new Promise((r) => {
		resolveDone = r;
	});
	while (queue.length > 0) {
		const line = queue.shift();
		const [cmd, ...rest] = line.trim().split(/\s+/);
		if (!cmd) continue;
		const fn = COMMANDS[cmd];
		if (!fn) {
			console.log("unknown:", cmd, "— try: help");
			continue;
		}
		try {
			await fn(rest.join(" "));
		} catch (e) {
			console.log("ERROR:", e.message);
		}
		if (cmd === "quit") {
			rl.close();
			process.exit(0);
		}
		rl.prompt();
	}
	draining = false;
	resolveDone();
}

rl.on("line", (line) => {
	queue.push(line);
	drain();
});
rl.on("close", async () => {
	// stdin EOF (piped heredoc) fires 'close' immediately — before the queued
	// async commands have finished. Wait for the queue to drain first, or a
	// still-running `launch`/`nav` gets torn down mid-flight.
	await drainDone;
	await COMMANDS.quit();
	process.exit(0);
});

console.log("ts-portfolio driver — \"help\" for commands, \"launch\" to start");
rl.prompt();
