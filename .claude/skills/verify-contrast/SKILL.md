---
name: verify-contrast
description: Measure real WCAG contrast for a component in ts-portfolio from an actual rendered screenshot (not computed CSS, not eyeballing). Use before shipping any change to translucent, gradient, backdrop-filter, or otherwise non-solid backgrounds — anywhere a plain "background-color vs. text-color" contrast calculator can't give a real number, e.g. glass/blur effects, gradients, or images behind text. Also use to check hover/active/focus states, not just rest.
---

Why this exists: a background built from `backdrop-filter`, `color-mix()`,
gradients, or layered pseudo-elements doesn't have one CSS "background color"
you can hand to a contrast calculator. The only honest number comes from the
pixel a browser actually composites behind the text. This skill drives
Chromium via Playwright, finds the real text row inside the element (not a
guessed padding fraction — matters for flex-centered, fixed-height buttons),
and reads pixel data back with `sharp`.

This is exactly the gap that bit the liquid-glass button work (see
`docs/liquid-glass-technique.md`): a vivid translucent fill measured fine by
eye but failed 4.5:1 in every state until checked this way.

## Prerequisites

A dev server already running (see the `run-ts-portfolio` skill):

```bash
npx vite dev --port 3061 > /tmp/vite-dev.log 2>&1 &
echo $! > /tmp/vite-dev.pid
for i in $(seq 1 30); do curl -sf http://localhost:3061 >/dev/null 2>&1 && break; sleep 1; done
```

`playwright` and `sharp` are both already devDependencies — no extra install.

## Run

`check-contrast.mjs` itself has **zero project-specific code** — this
project's one quirk (scroll-reveal sections start at `opacity: 0`) is
supplied at the call site via `--pre-eval`, not hardcoded in the script.
That's what makes the script directly copy-paste portable to another
project: copy the file, drop the `--pre-eval` this project needs (or swap
in whatever the new project needs instead).

In ts-portfolio, always pass the reveal-forcing snippet:

```bash
node .claude/skills/verify-contrast/check-contrast.mjs \
  --url http://localhost:3061/ \
  --selector '[data-variant="default"]' \
  --pre-eval "document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'))" \
  [--nth 0] [--dark] [--state rest,hover,active,focus] [--x 0.06] [--wait 300]
```

- `--selector` — any CSS selector; combine with `--nth` to pick a specific
  match if more than one exists on the page (default: first match).
- `--pre-eval` — a JS snippet run in-page (via `page.evaluate`) right after
  load, before the dark-mode toggle and before anything is measured. Use it
  for whatever the target project needs to become measurable: forcing a
  scroll-reveal component visible (this project), dismissing a cookie
  banner, waiting for a web font, etc. Omit it entirely for a project that
  needs no such setup.
- `--dark` — adds the `.dark` class to `<html>` before measuring (this
  project's dark-mode toggle mechanism — a very common Tailwind convention,
  but if a different project toggles theme some other way, e.g. a
  `data-theme` attribute, drive that through `--pre-eval` instead and skip
  `--dark`).
- `--state` — comma-separated list from `rest,hover,active,focus`. `active`
  is driven with a real `mousedown`, then released away from the element
  (not in place) so it doesn't fire a real click — releasing in place would
  navigate if the element wraps a link, corrupting every state captured
  after it.
- `--x` — horizontal sample position as a fraction of element width
  (default 0.06, i.e. near the left edge, ahead of left-aligned text). The
  vertical sample position is *not* a flag — it's computed automatically
  from the actual text node's bounding box, because guessing a fraction
  (e.g. "15% down") can land in blank padding above/below the glyphs rather
  than the row real text occupies, silently under- or over-stating risk.
- `--wait` — milliseconds to wait after `--pre-eval`/`--dark` before
  measuring (default 300). Bump this if a project's setup step is
  animated/async.

Exit code is non-zero if the worst-case state fails 4.5:1.

## Reusing this in a different project

1. Copy `check-contrast.mjs` (the whole file — it's self-contained).
2. Make sure `playwright` and `sharp` are devDependencies there (or
   `npm install -D playwright sharp`; run `npx playwright install chromium`
   once if it's a fresh install).
3. Start that project's dev server, then invoke with `--url`/`--selector`
   and whatever `--pre-eval` that project needs (often nothing at all).

No line in the script itself needs editing — the ts-portfolio-specific bit
lives only in the command line shown above, not in the file.

## Reading the output

```
state    bg-pixel          contrast  AA-normal(4.5)  AA-large/UI(3.0)
rest     rgb(26,111,222)     4.64:1   PASS            PASS
hover    rgb(21,108,221)     4.81:1   PASS            PASS
```

- **4.5:1** is the WCAG AA threshold for normal text.
- **3.0:1** applies only to large text (>=24px, or >=18.66px/14pt bold) or
  non-text UI components/graphics (e.g. an icon-only button, a focus ring) —
  don't use the looser threshold for a normal-size text label.

## Gotchas

- **This project's `Reveal` component** (`src/components/reveal.tsx`) keeps
  sections at `opacity: 0` until scrolled into view; the script force-shows
  everything via `.reveal.is-visible` right after load. If you add a new
  scroll-triggered pattern elsewhere, replicate that or the element won't be
  visible to screenshot.
- **Don't use `page.mouse.down()` + `page.mouse.up()` at the same
  coordinates** to simulate `:active` on an anchor or button-wrapping-link —
  that's a real click and will navigate the page away mid-script, so every
  screenshot after it is silently for the wrong page. This script already
  handles it by moving the mouse away before releasing; do the same in any
  ad-hoc variant.
- **`getComputedStyle(...).color` isn't always `rgb()`** if authored in
  `oklch()`/`oklab()`/`color-mix()` — this script resolves it through a real
  in-page `<canvas>` fillStyle round-trip rather than string-parsing, which
  handles any valid CSS color.
- A translucent fill's *rest* state is usually the tightest margin — hover
  and active states in this project's glass buttons only increase fill
  opacity, so if rest passes with margin the rest usually do too, but check
  at least once per component rather than assuming.
