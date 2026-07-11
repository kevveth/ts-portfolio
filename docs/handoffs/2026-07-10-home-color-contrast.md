# Handoff: make the home page pass WCAG AA color contrast

Audience: implementing agent (Codex). Scope: the home page (`/`) of
ts-portfolio, branch `feat/liquid-glass-buttons`. Goal: every text element on
the home page measures ≥ 4.5:1 (normal text) / ≥ 3:1 (large text) in **both
themes**, with the smallest possible change set. No visual redesign — two
targeted fixes.

Every number below was **measured on 2026-07-10** against the running app
(axe-core scan of the full page in both themes, plus per-pixel sampling of
composited backgrounds with `.claude/skills/verify-contrast/check-contrast.mjs`
for the elements axe can't compute: glass buttons, text over the hero canvas).
Do not re-derive these from CSS by eye — the glass surfaces have no single
"background color". Re-measure with the same tools after changing anything
(see Verification).

## Audit results

### Failures (fix these)

| # | Element | Theme | Measured | Required |
|---|---------|-------|----------|----------|
| 1 | Sapphire glass CTA labels — white text on `.ui-btn-glass-colored`. Three instances: hero "View the case study", featured "Read the case study", contact email button | light | **1.31–1.61:1** (worst: focus 1.43, featured rest 1.31; all states of all three fail) | 4.5:1 |
| 2 | "Live" status badge in the featured section — `text-green-700` on `bg-green-500/10` over the white card | light | **4.27:1** (12 px text) | 4.5:1 |

Both fail **only in light mode**. Dark mode passes everywhere (sapphire
buttons measure 15.7–18.3:1 with white text; axe reports zero dark-mode
violations).

### Passes (do NOT touch these)

Measured; listed so nothing gets "improved" unnecessarily:

- Neutral (uncolored) glass buttons, both themes, all four states: 8.4–10.3:1.
  Their `text-fg` label color is already theme-aware — this is the model for
  fix #1.
- Hero text over the lava-lamp canvas: h1 17.4–18.4:1, kicker 5.7/7.7:1,
  bio paragraph 5.3/7.4:1 (light/dark).
- Hero brand-colored role span ("Full-stack developer.", 24 px → 3:1 rule):
  4.69:1 light, 5.56:1 dark.
- Contribution graph footer/labels: 5.5:1 light, 16.6:1 dark.
- The other status badges: violet "Prototype" measures 6.44:1, zinc passes —
  only green fails.
- Everything else on the page: axe color-contrast scan is clean in both
  themes apart from the two failures above.

## Fix 1 — sapphire glass button labels (the big one)

**Root cause:** `ui-library` (linked local package at `../ui-library`)
hardcodes `text-white` on colored glass buttons
(`src/components/Button/Button.tsx:123`), but the colored-glass fill
(`src/styles/glass.css`, `.ui-btn-glass-colored`) is only a 7–15%-alpha stone
tint — the composited pixel is essentially the page background. Over this
site's near-white light background, white text lands at ~1.3–1.6:1.

**Fix (recommended — in `../ui-library`, then rebuild):** make the label
color theme-aware, deriving a dark "ink" from the stone color, the same way
the neutral variant already uses theme-aware `text-fg`.

Verified ink formula: `color-mix(in srgb, var(--glass-color) 45%, black)`
- sapphire ink (`#0e1a3e`) vs the measured worst-case light pixels:
  **10.6–13.0:1** across all three instances and all states.
- holds for every stone in the palette, worst case on pure white: diamond
  5.83, peridot 7.72, topaz 8.18, opal 9.3:1 — so it's safe as a library-wide
  default, not just for sapphire.

Edits in `../ui-library`:

1. `src/components/Button/Button.tsx:123` — drop the hardcoded `text-white`:

   ```tsx
   isGlass ? (isColored ? "ui-btn-glass-colored" : "text-fg") : "",
   ```

2. `src/styles/glass.css` — in the `.ui-btn-glass-colored` block (~line 146),
   set the light-theme ink and remove the white-text-era shadow:

   ```css
   color: color-mix(in srgb, var(--glass-color) 45%, black);
   ```

   and delete (or scope to dark, see next step) the existing
   `text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);` — a dark halo under dark
   text just muddies it. The label span's existing white
   `drop-shadow` (`.ui-btn-glass-label`) is a correct subtle emboss for dark
   ink; leave it.

3. `src/styles/glass.css` — in the existing dark-theme override block
   (`:is([data-theme="dark"], .dark) .ui-btn-glass-colored`, ~line 237), keep
   white text (measured 15.7–18.3:1) and keep the dark text-shadow there:

   ```css
   color: #ffffff;
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
   ```

4. **Trap — the reduced-transparency fallback needs its own color.** Inside
   `@media (prefers-reduced-transparency: reduce)` the colored button's fill
   becomes `--glass-tint-reduced` = `color-mix(in srgb, var(--glass-color)
   92%, black)` — a near-opaque **deep** stone fill. Dark ink on that would
   fail. Add inside that media block:

   ```css
   .ui-btn-glass-colored,
   .ui-btn-glass-colored:hover,
   .ui-btn-glass-colored:active {
   	color: #ffffff;
   	text-shadow: none;
   }
   ```

   (White on the reduced sapphire fill ≈ 11:1. Known pre-existing library
   caveat, out of scope here: for *light* stones — diamond, peridot, opal,
   topaz — white on the 92% fill was already low-contrast before this change;
   worth a library follow-up, but no light stone is used on the home page.)

5. Rebuild the package so the portfolio picks it up: `npm run build` in
   `../ui-library` (the portfolio imports the compiled `dist/ui-library.css`
   via `@import 'ui-library/styles.css'`). Also run that repo's own
   `npm run typecheck` and `npm run test`, and eyeball the Button stories in
   Storybook — the stones must still read as their hue, now as ink instead
   of white-on-wash in light mode.

**Alternative (if touching ui-library is off the table):** portfolio-only
override in `src/styles.css` (after the `ui-library/styles.css` import, which
it already is — unlayered rules there beat the library's utility layer):

```css
.ui-btn-glass-colored {
	color: color-mix(in srgb, var(--glass-color) 45%, black);
	text-shadow: none;
}
.dark .ui-btn-glass-colored {
	color: #fff;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}
@media (prefers-reduced-transparency: reduce) {
	.ui-btn-glass-colored,
	.dark .ui-btn-glass-colored {
		color: #fff;
		text-shadow: none;
	}
}
```

Pick **one** of the two approaches, not both. Prefer the library fix — the
defect is intrinsic to the library (any consumer with a light background
hits it), and both repos are ours.

## Fix 2 — "Live" status badge green

`src/content/projects.ts` (~line 36), `STATUS_META.live.badgeClass`: change
`text-green-700` → `text-green-800`.

- Measured: green-700 on the composited badge background `#dff3e8` = 4.27:1;
  green-800 (`#016630`) = **6.15:1**.
- Leave the `dark:text-green-400` half and the dot/border classes untouched
  (dark passes today). Leave violet and zinc entries alone (both pass).

## Verification (required before handing back)

1. Start the dev server: `pnpm exec vite --port 3050` (note: there is no
   `dev` npm script).
2. Re-measure the glass buttons — all three colored instances, light theme,
   must now be ≥ 4.5:1 in every state (expect ~10:1+), and dark must still
   pass:

   ```bash
   for n in 0 1 2; do
     node .claude/skills/verify-contrast/check-contrast.mjs \
       --url http://localhost:3050/ \
       --selector '.ui-btn-glass-colored' --nth $n \
       --pre-eval "document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'))" \
       --state rest,hover,active,focus
   done
   # repeat with --dark
   ```

   The script exits non-zero on a worst-case failure. The `--pre-eval` is
   mandatory (scroll-reveal sections are otherwise `opacity: 0`).
3. Re-run an axe color-contrast scan of `/` in both themes (axe-core and
   playwright are devDependencies; toggle dark by adding the `dark` class to
   `<html>`). Expect **zero violations** in both. The previous scan's only
   violation was the green badge.
4. Visual check, both themes: screenshot the hero and contact sections
   (`.claude/skills/run-ts-portfolio/driver.mjs` if useful). The buttons must
   still read as sapphire glass — the fix changes only label ink, not the
   material.
5. Portfolio gates: `pnpm check`, `pnpm test`, `pnpm typecheck`. If
   ui-library was edited: its `npm run build`, `npm run typecheck`,
   `npm run test` too.

### Measurement gotchas (so the numbers don't mislead you)

- The contrast script samples one pixel at `--x` (fraction of element width)
  on the detected glyph row. A reading of exactly **1.00:1 or a bg-pixel
  equal/close to the text color means you hit a glyph**, not a real failure —
  re-sample at other `--x` values (0.35/0.65/0.9) and trust the glyph-free
  readings. This audit hit that on the h1 and the brand span; both actually
  pass with wide margins.
- The hero canvas is animated (lava-lamp blobs, bounded at 30–45% brand
  alpha). Single samples vary a little frame-to-frame; the ~10:1 ink margin
  absorbs that, but don't chase small run-to-run differences.

## Out of scope, recorded for later

- Non-text contrast (WCAG 1.4.11) of the contribution-graph level-0 cells and
  the glass buttons' borders/focus rings was not audited beyond focus-state
  text sampling (focus outline uses `--color-primary`, ≥ 3:1 vs both page
  backgrounds).
- Both `ui-library/src/styles/tokens.css` (unlayered `:root`) and the
  portfolio's `@theme inline` define `--color-primary`, `--radius-*`, and
  `--font-sans` with different values; the unlayered library tokens win where
  the compiled library utilities reference them. Not a contrast failure
  today, but a foot-gun worth untangling separately.
- Light birthstones (diamond/peridot/opal/topaz) under
  `prefers-reduced-transparency` in ui-library — pre-existing white-on-light
  issue, unaffected by this change, none used on the home page.
