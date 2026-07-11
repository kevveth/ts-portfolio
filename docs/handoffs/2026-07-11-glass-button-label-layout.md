# Handoff: fix glass button label layout (icon wraps to its own line)

Audience: implementing agent (Codex). Scope: `../ui-library` (linked package —
`src/components/Button/Button.tsx`, `src/styles/glass.css`), verified from
`ts-portfolio` branch `feat/liquid-glass-buttons`.
Goal: every `variant="glass"` button renders its icon and text on one line with
the same 8px gap and comparable height as non-glass buttons; no consumer-side
markup changes needed in ts-portfolio.

Every claim below was **measured on 2026-07-11** against the running dev site
(`npx vite dev --port 3050` + `.claude/skills/run-ts-portfolio/driver.mjs`
screenshots and `eval` computed-style probes). Do not re-derive by eye;
re-measure with the same tools after changing anything (see Verification).

## Findings

- Glass buttons render **two lines tall**. Hero "View the case study"
  (glass, sapphire) measures **62px** high with the arrow icon wrapped onto
  its own line below the text; "Get in touch" renders the mail icon on a line
  *above* the text. Screenshots: `/tmp/portfolio-shots/hero-buttons.png`,
  `/tmp/portfolio-shots/contact-section.png` (regenerate with the driver:
  `screenshot-element div.mt-9.flex.flex-wrap|hero-buttons`).
- A non-glass comparison on the same site — "Browse all projects" (outline,
  `src/routes/projects.$slug.tsx:163`) — measures **38px**, single line.
- Computed styles on the hero glass anchor:
  - button root: `display: flex; gap: 8px; padding: 10px 20px; height: 62px`
  - `.ui-btn-glass-label` span: computed `display: block` (blockified — it is
    the root's only flex item)
  - the lucide `svg` inside the label: `display: block` (Tailwind preflight)
- The icon/text gap inside glass buttons is also structurally gone: the root's
  `gap-2` only separates flex *items*, and the label span is the single item.
  (JSX whitespace trimming means there isn't even a literal space between
  text and icon.)
- Affected consumers (all render icon + text through `asChild`):
  `src/components/hero.tsx:36-47`, `src/components/contact-cta.tsx:21-37`,
  `src/components/project-patterns.tsx:91-96`.

## Root cause

`Button.tsx` wraps all children of the glass variant in a single
`<span className="ui-btn-glass-label">` (non-asChild path
`Button.tsx:174`, asChild path `Button.tsx:187-194`) so the label paints above
the sheen/refraction pseudo-elements (`z-index: 1` vs the pseudos' `0`).

That wrapper defeats the root's flex layout twice over:

1. `gap-2` no longer applies between icon and text — they're inside one flex
   item, not siblings.
2. Inside the span the children are in normal flow, and Tailwind preflight
   sets `svg { display: block }`, so the icon breaks onto its own line —
   hence the 62px two-line pill.

Non-glass variants keep children as direct flex children, which is why only
glass buttons are broken.

## Fix

Preferred: keep the wrapper (it's the only reliable way to raise arbitrary
`asChild` content, including bare text nodes, above the pseudo-layers) and
make it a flex row itself.

1. **`ui-library/src/styles/glass.css` — `.ui-btn-glass-label`
   (glass.css:88-92):** add flex layout that mirrors the root:

   ```css
   .ui-btn-glass-label {
   	position: relative;
   	z-index: 1;
   	display: inline-flex;
   	align-items: center;
   	gap: inherit; /* picks up the root's gap-2 (or gap-1 on xs) */
   	filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.28));
   }
   ```

   `gap: inherit` matters — don't hardcode `0.5rem`, or `size="xs"`
   (`gap-1`) glass buttons drift out of sync with the size scale.

2. **`ui-library/src/components/Button/Button.tsx` — asChild glass path
   (Button.tsx:187-194):** while in here, remove the
   `contents.props.children[0]` fragment-indexing hack. Hoist the hidden
   filter `<svg>` into its own variable (e.g. `const filterSvg = isGlass ?
   (<svg …>…</svg>) : null;`) and compose both paths from it:

   ```tsx
   const childContents = isGlass ? (
   	<>
   		{filterSvg}
   		<span className="ui-btn-glass-label">{child.props.children}</span>
   	</>
   ) : (
   	child.props.children
   );
   ```

   Behavior-preserving refactor; it just stops the layout fix from depending
   on positional fragment indexing.

3. **`Button.tsx` size scale (Button.tsx:83-93), smaller but real:** the text
   sizes are inconsistent — `default` has a fixed height (`h-9`) while
   `sm`/`md`/`lg` are padding-only, so heights drift across variants and
   font metrics. Normalize to fixed heights, shadcn-style:

   ```ts
   xs: "h-6 gap-1 px-2 text-xs",
   sm: "h-8 px-3 text-sm",
   md: "h-9 px-4 text-sm",
   default: "h-9 px-4 text-sm",
   lg: "h-11 px-6 text-base",
   ```

   The `lg` bump from `px-5` → `px-6` is deliberate: glass buttons are full
   pills (`border-radius: 999px`), and once single-line, text at 20px padding
   crowds the curved ends. If Ken dislikes the wider stance, `px-5` is fine —
   the height normalization is the part that matters.

4. **Rebuild + relink check:** ts-portfolio consumes the *built* package
   (`link:../ui-library` → `dist/ui-library.js` / `dist/ui-library.css`).
   After editing, run `npm run build` in `ui-library`, then restart the
   portfolio dev server with `npx vite dev --force` (or clear
   `node_modules/.vite`) so optimizeDeps picks up the new dist.

## Verification (required before marking `done`)

From `ts-portfolio`, dev server on 3050 (see
`.claude/skills/run-ts-portfolio/README` for the driver workflow):

1. Driver probe on `/`: the hero glass anchor
   (`a.ui-btn-glass`) height is ≤ 44px (was 62), and
   `getComputedStyle(document.querySelector('.ui-btn-glass-label')).display`
   is `inline-flex` with `gap: 8px`.
2. `screenshot-element div.mt-9.flex.flex-wrap|hero-buttons` — icon and text
   on one line in both hero buttons, visible gap between them, in **both**
   themes (toggle via the header button or `document.documentElement.classList`).
3. Same visual check on `#contact` (three pills) and a project card's
   "Read the case study" button.
4. `npm run test` and `npm run typecheck` in ts-portfolio pass; `npm run
   test` (storybook vitest) and `npm run typecheck` in ui-library pass.
5. Because button geometry over the hero blobs changed, re-run the
   `verify-contrast` skill on the hero buttons (rest + hover) per
   `docs/liquid-glass-technique.md` — the blob tint percentages were tuned
   against the old button footprint and must still clear WCAG AA.

## Out of scope

- The hardcoded `"ui-btn-glass-colored text-white"` ink for colored glass
  (Button.tsx:123) and ts-portfolio's compensating override in
  `src/styles.css:10-26` — already tracked as Fix 1 of
  [2026-07-10-home-color-contrast](2026-07-10-home-color-contrast.md)
  (`in-progress`). Don't duplicate it here, but note the two handoffs touch
  the same lines in Button.tsx; land this one on top of whatever state that
  one left.
- Variant-name duplication (`primary`/`default`, `danger`/`destructive`,
  `secondary`/`outline` pairs in `variantClasses`) — worth consolidating via
  alias normalization at the top of `Button()` someday, but it's cosmetic
  and touching it here widens the blast radius.
- `[&_svg]:size-4` also matches the hidden filter svg; its inline
  `width: 0; height: 0` wins, so no action needed.

---

Register this handoff in `docs/handoffs/CHANGELOG.md` as `open` when you
create it.
