---
name: run-ts-portfolio
description: Build, run, test, and drive the ts-portfolio TanStack Start site. Use when asked to start the dev server, run the test suite, typecheck, take a screenshot of the portfolio, or interact with its UI (theme toggle, nav, project pages).
---

ts-portfolio is a TanStack Start (React SSR) site served by `vite dev`.
There's no `chromium-cli` in this environment, so it's driven by a
custom Playwright REPL at
`.claude/skills/run-ts-portfolio/driver.mjs`: start the dev server,
pipe commands into the driver's stdin, read screenshots back off disk.

All paths below are relative to the repo root.

## Prerequisites

Node with pnpm — this repo is pnpm-only (`package.json` pins
`pnpm@11.6.0` via `packageManager`, and `pnpm-lock.yaml` is the only
lockfile). Use `pnpm`/`pnpm exec`, never `npm`/`npx` — npm would write a
competing `package-lock.json`. Tested with Node v23.10.0 / pnpm 11.6.0.

`playwright` is a devDependency (added for this driver — see Setup).
It needs a cached Chromium build:

```bash
pnpm exec playwright install chromium   # skip if already cached, e.g. under ~/Library/Caches/ms-playwright
```

## Setup

```bash
pnpm install
```

`playwright` is already in `package.json` devDependencies. If it's
ever missing: `pnpm add -D playwright`.

No separate build step is needed to run the dev server.

## Run (agent path)

1. Start the dev server in the background and wait for it to answer:

```bash
pnpm exec vite dev --port 3050 > /tmp/vite-dev.log 2>&1 &
echo $! > /tmp/vite-dev.pid
for i in $(seq 1 30); do curl -sf http://localhost:3050 >/dev/null 2>&1 && break; sleep 1; done
```

(No `timeout` binary on macOS — use the poll loop above, not
`timeout 30 bash -c '...'`.)

2. Pipe commands into the driver via a heredoc (the driver defaults to
   `http://localhost:3050`; override with `PORTFOLIO_BASE`):

```bash
node .claude/skills/run-ts-portfolio/driver.mjs <<'EOF'
launch
nav /
ss 01-home
console-errors
click-text View the case study
wait main
eval new Promise(r => setTimeout(r, 800))
ss 02-case-study
quit
EOF
```

Screenshots land in `/tmp/portfolio-shots/` (override:
`SCREENSHOT_DIR`).

3. Stop the dev server when done: `kill $(cat /tmp/vite-dev.pid)`.
   Don't `pkill -f vite` broadly — this machine may have unrelated
   `vite preview`/other dev processes running; only kill the PID you
   started.

For iterative debugging, run the driver under `tmux` instead of a
one-shot heredoc and `send-keys` one command at a time — same
commands, same session. (Not verified in this environment: `tmux`
isn't installed here. The heredoc form above was used for all
verification and is the primary path.)

### Driver commands

| command | what it does |
|---|---|
| `launch` | launch Chromium (`reducedMotion: 'reduce'`, 1280×900) |
| `nav <path-or-url>` | navigate; bare paths resolve against `PORTFOLIO_BASE` |
| `ss [name]` | full-page screenshot → `SHOT_DIR/<name>.png` |
| `screenshot-element <sel>\|<name>` | screenshot one element |
| `click <css-sel>` | click via Playwright locator |
| `click-text <text>` | click first element containing text |
| `fill <css-sel> <text>` | fill an input |
| `type <text>` / `press <key>` | keyboard input |
| `wait <css-sel>` | wait up to 10s for an element |
| `eval <js>` | evaluate JS in the page, print JSON result |
| `text [css-sel]` | print `innerText` (body if no selector) |
| `html <css-sel>` | print `innerHTML` of first match |
| `console` / `console-errors` / `console-clear` | read/filter/reset captured console messages |
| `quit` | close the browser, exit |

## Run (human path)

```bash
pnpm dev   # → http://localhost:3000, Ctrl-C to stop
```

## Test

```bash
pnpm test        # vitest run — passes
pnpm typecheck   # tsc --noEmit — passes clean
pnpm check       # Biome lint + format — passes clean
```

## Gotchas

- **Sections render blank without `reducedMotion: 'reduce'`.**
  `Reveal` (`src/components/reveal.tsx`) keeps content at `opacity: 0`
  until an `IntersectionObserver` fires, or immediately if
  `prefers-reduced-motion: reduce` is set. A screenshot taken right
  after `goto()` on a normal page context shows only the header. The
  driver's `launch` already sets `reducedMotion: 'reduce'` — don't
  remove it.
- **Lazy-loaded images can still be blank in a `fullPage` screenshot.**
  `Picture` (`src/components/picture.tsx`) defaults `loading="lazy"`;
  only the home page's featured-project image opts into
  `loading="eager"`. On the case-study and `/projects` pages, taking
  `ss` immediately after `wait main` produced blank white boxes where
  gallery/card images belong. Adding `eval new Promise(r =>
  setTimeout(r, 800))` after the `wait` let most images finish loading
  (confirmed by re-screenshotting). Even then, the last image in a long
  gallery can still lag — if a screenshot must be pixel-complete,
  either wait longer or force-load first: `eval
  document.querySelectorAll('img').forEach(img=>img.loading='eager')`.
- **Piped-stdin heredocs can race the driver's own async commands.**
  When stdin is a heredoc (not a real TTY), Node's `readline` fires
  every `line` event synchronously before any `async` handler
  resolves — a naive `rl.on('line', async ...)` lets `nav` start
  before `launch` finishes, or lets `close` fire (and `process.exit`)
  before the last command completes. `driver.mjs` queues commands and
  makes `close` wait for the queue to drain — if you edit the driver,
  keep that structure.

## Troubleshooting

- **`curl: connection refused` polling port 3050**: dev server hasn't
  bound yet or crashed — check `/tmp/vite-dev.log`.
- **`EADDRINUSE` starting `vite dev`**: a previous run wasn't stopped.
  `kill $(cat /tmp/vite-dev.pid)` if you have the PID, otherwise find
  it with `lsof -i :3050` and kill that specific PID (avoid a broad
  `pkill -f vite` — see the Run section note on unrelated `vite`
  processes).
- **`command not found: timeout`**: macOS has no `timeout` builtin.
  Use the `for`/`sleep` poll loop shown above instead.
