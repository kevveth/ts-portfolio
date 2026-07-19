# Handoff: Frontend polish pass — dual-theme coherence, filler cleanup, contributions hardening

Audience: implementing agent (Codex). Scope: `src/` (styles.css, content, components, lib) plus one
investigation into the `ui-library` dependency; branch `refactor-ui`.
Goal: every task below lands with its own verification step passing, the global gates
(`pnpm test`, `pnpm typecheck`, `pnpm check`) stay green, and no visual regression appears in the
driver screenshots of Home / Projects / case study in both themes.

Every claim below was **measured on 2026-07-14** against the running dev server (vite on :3050,
driven by `.agents/skills/run-ts-portfolio/driver.mjs`, full-page screenshots at 1280×900 and
390×844) and direct file reads. Re-measure with the same tools after changing anything.

## Context — decisions already made (do not relitigate)

Ken reviewed the full design audit and chose:

1. **Keep the dual theme identity** (azure/green light, crimson/white dark) as a deliberate
   day/night feature — but tune each mode so both feel equally committed. Do **not** consolidate
   the palettes.
2. **Polish pass only** — no structural redesign of hero, layout, or typography.
3. **Enrich the `/projects` index** rather than redirecting it. Ken explicitly rejected listing
   `ui-library` on the site (it has one design and no roadmap), so the enrichment is a
   colophon-style section about this site itself — see T7. Do not add ui-library content
   anywhere visitor-facing.
4. All three code-health tasks below are in scope.

## Findings

- **F1 — Light contribution ramp is incoherent.** `src/components/contribution-graph.tsx:17-20`
  hand-picks 5 light colors ending `#28b9c8 → #5b9f20`: the ramp runs pale blue → teal → then
  jumps to green at level 4, so the "Less … More" legend ends in a hue that doesn't belong to the
  sequence (visible in screenshot `/tmp/portfolio-shots/01-home-light.png`). The dark ramp
  (charcoal → crimson) is a coherent monotone sequence. The block comment above the constant
  (lines 10-15) claims each theme is a 2-color pair the library interpolates — stale; the arrays
  have 5 entries.
- **F2 — Stack strip duplicates the featured project's chips.** `src/components/stack-strip.tsx`
  renders `SITE.skills` as a flat chip wall one scroll below the featured project's `TechStack`
  chips; 8 of 11 chips are identical between the two. Reads as filler.
- **F3 — `featured-visual` offset shadows are invisible in dark mode.** `src/styles.css:360-364`
  uses `--signal` at 10% and `--brand` at 6% over a near-black background — the "stacked paper"
  signature only exists in light mode (compare screenshots 01 vs 02).
- **F4 — Case-study highlight markers imply sequence.** `src/routes/projects.$slug.tsx:170-172`
  numbers highlights `01`–`04`, but they aren't sequential steps. The outcomes list right below
  uses a mono `▸` marker for the same "list of facts" job.
- **F5 — Kicker prefix spans carry a no-op class.** `.kicker > span { color: var(--signal) }`
  (`src/styles.css:194-196`) out-specifies the `text-brand` utility on the same spans
  (`src/components/hero.tsx:22`, `src/components/section.tsx:67` and `:102`), so `text-brand`
  there is dead code that misleads readers about the rendered color.
- **F6 — Mobile hero contrast is unverified.** At 390px the bio paragraph's right edge sits over
  the blob field behind `hero-copy-wash` (`/tmp/portfolio-shots/07-home-mobile-light.png`).
  Probably passes, but nothing has measured it.
- **F7 — `/projects` is a room with one chair.** One card in a `max-w-3xl` column with a large
  empty right gutter at 1280px (`/tmp/portfolio-shots/06-projects-light.png`). The page adds a
  click over Home's featured section without adding information. (The card itself was just
  refactored in the 2026-07-14 handoff — don't churn its internals.)
- **F8 — `fetchContributions` runs uncached in the SSR request path.**
  `src/lib/github.ts:116-173` hits GitHub GraphQL on every server render of `/` — latency plus an
  external point of failure on the most important page. Its docstring says the token "must be
  available at build time"; it's actually read per request. Worse, failure strings are rendered
  to visitors verbatim via `ContributionGraphError` — a missing env var in prod would print
  "GITHUB_TOKEN is not set" on the homepage. (Verified today: the graph *does* survive
  client-side nav away and back, so this is hardening, not a bug fix.)
- **F9 — Duplicated theme-watching.** `contribution-graph.tsx:50-60` and
  `hero-blobs.tsx:201-217` each run their own `MutationObserver` on `<html class>`.
- **F10 — Inert directive.** `src/components/site-header.tsx:1` has `"use client"`; TanStack
  Start doesn't use RSC directives.
- **F11 — `ui-library` is a sibling-path link.** `package.json:38` and `pnpm-lock.yaml:65-67`
  pin `link:../ui-library`. `.vercel/project.json` shows the repo is linked to a Vercel project.
  A fresh clone without the sibling directory may not install/build — unconfirmed either way.

## Fix

Work the tasks in order; 1–7 are design, 8–10 are code health.

### T1 — Rebuild the light contribution ramp inside the azure family (F1)

In `contribution-graph.tsx`, switch `CONTRIBUTION_THEME` to the two-color form the comment already
describes, letting react-activity-calendar interpolate the middle levels:

- `light: [<level-0>, <level-4>]` where level-0 stays the current `#e1e4e7` and level-4 is the
  resolved hex of the light brand token `oklch(0.5 0.2 250)`. Resolve it exactly — don't guess:
  in the driver run `eval` with the same 1×1-canvas probe technique as
  `resolveCssColor` in `hero-blobs.tsx:25-36` against `getComputedStyle(document.documentElement).getPropertyValue('--brand')`.
- `dark: [<level-0>, <level-4>]` — try `["#29272d", "#f05a65"]` (current endpoints). Screenshot
  both themes and compare against the current dark ramp; if the interpolated middles visibly
  regress the dark mode look, keep dark as the existing 5-tuple and only convert light (the
  comment then needs to describe the mixed shape honestly).

The legend fixes itself since it renders from the same theme.

### T2 — Regroup the stack strip so it carries different information than the chips (F2)

Change `SITE.skills` (`src/content/site.ts:50-62`) from a flat array to labeled groups:

```ts
skills: {
	build: ["TypeScript", "React 19", "TanStack Start", "Node.js", "Tailwind CSS", "Square SDK", "Zod"],
	verify: ["Vitest", "Playwright", "axe-core"],
	ship: ["Vercel"],
}
```

Render each group in `stack-strip.tsx` as a row: a `kicker`-styled mono label (`build` /
`verify` / `ship`) followed by its chips, keeping the existing `Surface` +
`accent-surface` shell. This states *what role each tool plays* instead of repeating the
featured project's flat list. Update anything that consumed the flat array (grep for
`SITE.skills`; `src/content/projects.test.ts` may assert on it).

### T3 — Make the featured-visual shadows exist in dark mode (F3)

Add a dark override in `styles.css` near `.featured-visual`:

```css
.dark .featured-visual {
	box-shadow:
		10px 10px 0 color-mix(in oklab, var(--signal) 22%, transparent),
		-8px -8px 0 color-mix(in oklab, var(--brand) 30%, transparent);
}
```

Tune the two percentages by screenshot until the offset planes are clearly visible on the dark
card without glowing — target "as noticeable as light mode's", not louder.

### T4 — Swap numbered highlight markers for the ▸ marker (F4)

In `projects.$slug.tsx` `HighlightList`, replace the `String(index + 1).padStart(2, "0")` span
with the same `▸` mono-brand marker used by the outcomes list (`projects.$slug.tsx:111-113`).
The index parameter becomes unused — remove it.

### T5 — Remove the dead `text-brand` on kicker prefix spans (F5)

Drop the `text-brand` class from the `aria-hidden` prefix spans in `hero.tsx:22` and
`section.tsx:67`/`:102` (the `.kicker > span` rule is the one actually painting them). Leave the
CSS rule as is.

### T6 — Measure mobile hero contrast; strengthen the wash only if it fails (F6)

Run the `verify-contrast` skill (`.agents/skills/verify-contrast/`) on the hero bio paragraph and
the role line at 390px width, both themes, rest state. If any sample lands under WCAG AA (4.5:1),
widen/strengthen `hero-copy-wash` in the existing `max-width: 47.999rem` media block
(`styles.css:403-410`) — e.g. raise the 75% stop toward 85% or extend the wash width — and
re-measure. If it passes, change nothing and record the numbers in this file.

### T7 — Add an "under the hood" colophon section to /projects (F7)

Keep the existing single-card layout untouched. Below the grid in `projects.index.tsx`, add a new
`Section` (spacing `compact`, `divided`) that treats this site itself as the second exhibit — a
colophon, not a project card, so it doesn't compete with Chavo's Parlor:

- `SectionHeading kicker="under the hood" title="This site is a build too"`
- One short paragraph, muted text, reading-width. Copy (reviewed with Ken 2026-07-14; small
  wording adjustments are fine, no new claims):

  > This portfolio is built the same way I build client work: TanStack Start with SSR, a
  > hand-rolled canvas hero that respects reduced motion and transparency, a contribution graph
  > fed by GitHub's GraphQL API, and Vitest, Playwright, and axe-core keeping it honest.

- A "View the source" link to `https://github.com/kevveth/ts-portfolio` (repo confirmed public
  on 2026-07-14 — API returns 200) styled as a `portfolio-link` Button, external-link icon,
  `target="_blank" rel="noreferrer"`, with an aria-label noting it opens in a new tab.

Hardcode the repo URL in `src/content/site.ts` (e.g. `siteRepo`) rather than in the component,
matching the "components never hardcode URLs" convention documented at the top of that file.

### T8 — Contributions: server function, TTL cache, friendly errors (F8)

- Keep `quantizeLevel`, `mapContributions`, and the zod schemas exported as-is (unit tests in
  `src/lib/github.test.ts` cover them).
- Wrap the fetch in a `createServerFn` (from `@tanstack/react-start`) — e.g.
  `getContributions` — with a module-level cache `{ result, expiresAt }` and a 1-hour TTL.
  Cache only successful results; failures should retry on the next request.
- The route loader (`src/routes/index.tsx:24-27`) calls the server function.
- Error copy: log the technical detail server-side (`console.error`), and always return a single
  visitor-safe message, e.g. "Contribution data isn't available right now." Update
  `ContributionGraphError` to append a link to `https://github.com/kevveth` ("see the live graph
  on GitHub") using `SITE.github`.
- Fix the docstring: the token is read at request time on the server, not build time.

### T9 — Small tidies (F9, F10)

- Add to `src/lib/theme.ts`: `subscribeToThemeChange(cb: (theme: Theme) => void): () => void`
  wrapping the MutationObserver, and a `useTheme(): Theme` hook built on it (initial state
  `"light"` to stay SSR-hydration-safe, resolve in effect — preserve the existing behavior
  documented in `contribution-graph.tsx:43-49`). Use the hook in `contribution-graph.tsx` and the
  subscribe util in `hero-blobs.tsx` (replacing its inline `themeObserver`).
- Delete `"use client"` from `site-header.tsx:1`.
- If T1 kept a 5-tuple anywhere, rewrite the `CONTRIBUTION_THEME` comment to match reality.

### T10 — ui-library deploy investigation (F11)

Investigation first, code second:

1. Clean-room test: clone this repo into a temp dir **without** `../ui-library` present, run
   `pnpm install` and `pnpm build`, and record exactly what happens.
2. If it builds (pnpm tolerating the dangling link and vite resolving from the committed
   lockfile somehow), document why in this handoff and stop — no change needed.
3. If it breaks (expected): report findings and the recommended fix in this handoff, then mark
   this task `blocked` for Ken's call. Sketch the options honestly: publish `ui-library` to a
   registry (GitHub Packages), vendor its `dist/` via a `file:` tarball, or a pnpm-workspace
   restructure (largest change). Do **not** restructure repos unilaterally. Ken can also check
   the Vercel dashboard build logs to see how production currently succeeds.

## Verification (required before marking `done`)

1. `pnpm test` — all pass.
2. `pnpm typecheck` — clean.
3. `pnpm check` — clean.
4. Driver run (`.agents/skills/run-ts-portfolio/driver.mjs`): full-page screenshots of `/`,
   `/projects`, `/projects/chavos-parlor` in both themes. Confirm: light contribution legend ends
   in an azure-family color (T1); stack strip shows grouped rows (T2); dark featured card shows
   visible offset planes (T3); case-study highlights show `▸` markers (T4); `/projects` shows the
   "under the hood" colophon with a working source link (T7).
5. verify-contrast numbers for the mobile hero recorded above (T6), all ≥ 4.5:1.
6. Kill the dev server after (T8 sanity): load `/`, navigate to `/projects` and back — graph
   still renders; then confirm the server log shows **one** GitHub fetch for repeated loads
   within the TTL (add a temporary log or check timing).
7. T10's outcome is written into this file (either "no change needed because…" or findings +
   recommendation + `blocked`).
8. Update the CHANGELOG row: `done` once every box above is checked (the T7 copy was already
   reviewed with Ken in-session on 2026-07-14); use `needs-review` only if something above
   couldn't be fully confirmed.

## Out of scope

- Consolidating the light/dark identities — Ken decided to keep both.
- Hero composition, typography system, section rhythm — polish pass only.
- The projects-index card internals — just refactored (2026-07-14 handoff); leave them.
- Router config (`defaultPreloadStaleTime: 0`) — intentional; the T8 cache makes repeated loader
  runs cheap anyway.
- `portfolio-primary`/`portfolio-link` overriding ui-library Button styles via global CSS — a
  known smell, but touching it means touching ui-library variants; not part of this pass.

---

Register this handoff in `docs/handoffs/CHANGELOG.md` as `open` when you create it.

## Codex implementation record — 2026-07-14

T1–T9 are implemented and verified. The light contribution ramp now resolves the browser-rendered
light `--brand` endpoint (`oklch(0.5 0.2 250)`) to `#0061ce`; both themes use two-color endpoint
pairs and browser interpolation. The stack is grouped by build/verify/ship, the dark featured
planes are visible without reading as glow, highlight markers use `▸`, dead kicker utilities are
removed, `/projects` includes the reviewed colophon and working source link, contributions use a
server function with a one-hour success-only cache and visitor-safe failure state, theme watching
is shared, and the inert client directive is gone.

Mobile hero contrast at 390×844, sampled at the paragraph's right edge over the composited blob
field:

- Bio, light: 5.13:1.
- Role line, light: 15.44:1.
- Bio, dark: initially 3.95:1; after widening/strengthening the mobile wash, 6.63:1.
- Role line, dark: 17.22:1.

The required Home, Projects, and Chavo's Parlor screenshots were captured at 1280×900 in both
themes and visually reviewed. Repeated Home → Projects → Home navigation kept the graph rendered;
temporary server instrumentation recorded exactly one GitHub GraphQL fetch, then was removed.
`pnpm test` (42 tests), `pnpm typecheck`, `pnpm check`, and `pnpm build` all pass.

The original T10 investigation found the sibling link failure. A clean clone was created at
`/tmp/ts-portfolio-clean.5WlYla/ts-portfolio` with no sibling `ui-library`. `pnpm install`
succeeded but misleadingly installed `ui-library 0.0.0 <- ../ui-library`; `pnpm build` then failed
in Tailwind/Vite with `Can't resolve 'ui-library/styles.css'`.

T10 is now **resolved** with the deliberately simpler Git dependency model Ken selected. The
library's verified pnpm migration and theme-aware glass ink are pushed at commit
`5cd28ff74cf0f714d4052146623df5efba7335cf` (draft PR #1). The portfolio pins that exact commit,
and `pnpm-workspace.yaml` narrowly permits only that commit's `prepare` build. A second clean clone
at `/tmp/ts-portfolio-gitdep.VtO420/ts-portfolio`, again with no sibling library, completed
`pnpm install --frozen-lockfile` and `pnpm build` successfully. No package registry, release
version, or authentication configuration is required.
