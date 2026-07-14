# Handoff: refactor the /projects index and project card

Audience: implementing agent (Codex). Scope: `src/routes/projects.index.tsx`,
`src/components/project-card.tsx`, `src/content/projects.ts` (+ its test),
`src/components/ui/card.tsx` (deletion), branch `refactor-ui`.
Goal: the index reads as a deliberate one-project page — card aligned to the
page's left edge, no empty grid column, no under-resolved thumbnail, no
half-used Card abstraction — and the card's alt text no longer depends on
gallery ordering.

Every claim below was **measured on 2026-07-14** against the running dev server
(`vite dev` on :3050, Playwright at a 1280×900 viewport, DPR 1) and `grep` over
`src/`. Do not re-derive by eye; re-measure with the same tools after changing
anything (see Verification).

This handoff supersedes an earlier Codex review of the same surface. Where the
two differ, the differences are called out inline — they are deliberate, and
three of them exist because that review was done without a browser.

## Findings

1. **The grid leaves half the page empty.** With one project, the grid computes
   to `grid-template-columns: 484px 484px` — the second column is empty. The
   page reads lopsided. `projects.index.tsx:38` (`grid gap-6 md:grid-cols-2`),
   single project at `projects.ts:90`.

2. **The card's thumbnail alt text is coupled to gallery ordering.**
   `project-card.tsx:23-27` renders `getProjectThumb(project.slug)` (which
   resolves to `hero.png?thumb` via `project-images.ts:27`) but labels it
   `alt={project.gallery[0].alt}`. These are two independent sources. They agree
   today only because `gallery[0]` happens to be the hero. Reordering the
   gallery — a routine content edit — would silently leave the card describing a
   different image. This is the only genuine correctness bug on this surface.

3. **`Surface` and the Card system overlap.** `ProjectCard` uses `Surface` as its
   container (`project-card.tsx:18`) but borrows `CardHeader`, `CardContent`,
   `CardTitle`, `CardDescription`, and `CardAction` from a separate Card system.
   `grep -rn "components/ui/card" src/` returns **exactly one importer**:
   `project-card.tsx`. Two radius/spacing/shadow conventions for one card.

4. **The card's only affordance is an unlabeled arrow.** `project-card.tsx:44-51`
   renders an `aria-hidden` circular arrow; the homepage says "Read the case
   study" (`project-patterns.tsx:95`). Inconsistent action language.

   Note: this is a **consistency/affordance issue, not an accessibility one.**
   The stretched link already carries `aria-label="View {title} case study"`
   (`project-card.tsx:35`) and the arrow is already `aria-hidden`. Do not "fix"
   a11y here that isn't broken.

5. **`DESCRIPTION` does double duty** as both `<meta>` content and the visible
   lede (`projects.index.tsx:9-10`, consumed at `:34`), so the page opens
   reading like a search snippet.

## Root cause

The card was built for a multi-project grid that doesn't exist yet. Every
symptom above follows from that: a two-column layout with one item, a card
sized for a 484px column, and a Card abstraction adopted for slots the card
barely uses. The fix is to make the layout a function of the data instead of an
assumption about it.

The alt-text bug (finding 2) is independent — it's a plain two-sources-of-truth
mistake.

## Fix

Do these in order. Step 4 gets substantially easier if step 3 runs first.

### 1. Break the alt-text coupling

Add an explicit `thumbAlt: string` to the `Project` type (`projects.ts:69-86`),
populate it for `chavos-parlor`, and use it in `project-card.tsx` instead of
`project.gallery[0].alt`. Extend the content-contract tests in
`projects.test.ts` to assert every project has a non-empty `thumbAlt`.

### 2. Make the grid a function of project count

In `projects.index.tsx:38`, render a **single `max-w-3xl` column when there is
one project**, keeping `md:grid-cols-2` when there are more.

Two hard constraints, both of which a code-only review missed:

- **Left-align it — do NOT center it.** Use `max-w-3xl` with **no `mx-auto`**.
  Measured: `PageIntro` sits at left edge **144px**, width **768px**. A
  left-aligned `max-w-3xl` card lands at exactly 144px / 768px, flush with the
  kicker, title, and lede. Adding `mx-auto` pushes the card's left edge to
  **256px**, visibly breaking the vertical line the rest of the page shares.
  (An earlier review recommended centering. It is wrong; both were rendered and
  compared.)

- **Update the `sizes` hint with the layout.** `project-card.tsx:26` hardcodes
  `sizes="(min-width: 768px) 50vw, 100vw"`. Under a single column the image slot
  becomes **766px**, but that hint still declares 50vw (**640px**), so the
  browser fetches the 640px candidate and upscales it — measured
  `underResolved: true`, i.e. a blurry thumbnail. Plumb the correct hint through
  (roughly `(min-width: 768px) 768px, 100vw` for the single-column case). The
  rule: `sizes` must describe the slot the image actually occupies.

### 3. Replace the arrow with an explicit action label

Remove the `CardAction` arrow (`project-card.tsx:44-51`). Keep the stretched
card link and its existing `aria-label`, and show a **non-interactive** "View
case study →" label in the card. Do not add a nested link.

### 4. Collapse the Card slots into `Surface`

Replace `CardHeader` / `CardContent` / `CardTitle` / `CardDescription` with
plain semantic wrappers inside `Surface`, then delete
`src/components/ui/card.tsx` (re-run the grep first to confirm nothing else
imports it).

Two traps:

- **`Surface` has no padding of its own** (`surface.tsx:24` — only
  `rounded-lg` + variant border/shadow). Every bit of the card's horizontal
  padding comes from `CardHeader`/`CardContent`'s `px-6`, and its vertical
  rhythm from `pt-5` / `pt-4 pb-6`. A naive removal collapses the padding.
  Preserve the current spacing exactly.
- Step 3 removes `CardAction`, which is the only reason `CardHeader`'s
  `has-data-[slot=card-action]:grid-cols-[1fr_auto]` grid
  (`ui/card.tsx:23`) exists. With it gone, this is a plain flex column.

### 5. Split SEO copy from the visible lede

Keep `DESCRIPTION` (`projects.index.tsx:9`) for `meta`/OG, and add a shorter,
more personal visible description for `PageIntro` (`:34`).

### 6. (Optional, P3) Explicit aspect frame on thumbnails

Add the `aspect-[16/10]` frame the gallery uses (`gallery.tsx:25`), as
future-proofing so later project cards align predictably.

Expect **no visual change today**: `hero.png` is 2880×1800 — already exactly
16:10, serving 640×400 and rendering at 482×301. This is a guard, not a fix;
don't inflate its priority.

Use **`object-contain`**, matching `gallery.tsx:32`. Do **not** use
`object-cover` (an earlier review recommended it, incorrectly, on the belief
that the gallery uses cover — it does not). These are UI screenshots; cropping
destroys content.

## Verification (required before marking `done`)

1. `pnpm test`, `pnpm typecheck`, `pnpm check` — all pass.
2. Render `/projects` at 1280px (`.claude/skills/run-ts-portfolio/`) and assert,
   with one project:
   - the card's left edge is **144px** and its width is **768px** — i.e. it
     matches `PageIntro`'s bounding box exactly;
   - the thumbnail's `naturalWidth` is **>= rendered CSS width × DPR** (no
     under-resolution).
3. Temporarily add a second fake project; confirm the two-column grid still
   renders correctly at `md`; remove it.
4. Card padding and vertical rhythm are visually unchanged from before the
   refactor.
5. `grep -rn "components/ui/card" src/` returns nothing.
6. `/projects` logs no console errors (see Out of scope — this was not
   established as clean beforehand, so treat a pre-existing error as a finding
   to report, not necessarily as something you broke).

## Out of scope

- **Do not add a `limit`/truncation option to `TechStack`.** An earlier review
  proposed capping the 9 stack badges at 5 with a "+4" overflow badge. Skip it.
  The badges only look bottom-heavy because the column is 484px wide, and step 2
  widens it to 768px, where they reflow to essentially one row — the symptom is
  caused by the layout the same review's top item already fixes. It's also the
  only proposal that adds new API surface, and it hides the stack on the page
  whose job is to advertise the stack.
- Do not restyle `PageIntro`, `Section`, `Surface`, the palette, or the global
  spacing system. They're sound; keep the blast radius on the index and the card.
- **Console cleanliness on `/projects` was never established.** The audit's own
  CSS injection polluted the console with a self-inflicted hydration warning, so
  there is no clean baseline. If you see a genuine console error, report it —
  don't assume you introduced it.
- The `Reveal`-wrapped grid has no empty state if `getAllProjects()` ever
  returns `[]`. Noted, not worth fixing at one project.

---

Registered in `docs/handoffs/CHANGELOG.md` as `open`.
