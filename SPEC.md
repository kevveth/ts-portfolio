# Developer Portfolio — Specification

## Context

Kenneth is a developer who just shipped a real client project (a custom booking site for **Chavo's Parlor**, a San Diego barber shop) built on the same modern stack as this repo — TanStack Start, React 19, Tailwind v4, Square SDK. He needs a portfolio to convert that work into career leverage.

The audience is **both recruiters/employers and freelance clients, weighted toward full-time hiring**. The portfolio must read first as proof of engineering skill (deep case study, clean technical aesthetic) while still being approachable to a small-business client. The core problem it solves: a strong project exists but there is no public artifact that showcases it credibly and is findable.

The current repo is a fresh TanStack Start scaffold. It ships an unused "island/sea" CSS design system in `src/styles.css` — **that aesthetic is being discarded** in favor of a clean, minimal/technical look. Every route is still the default placeholder.

## Goals

- A polished, fast, recruiter-credible portfolio that launches with **one deep flagship case study** (Chavo's Parlor) and a data model that makes adding future projects trivial.
- Distinctive but restrained "engineer" aesthetic — not a generic AI/template look.
- Excellent first impression when a link is shared (OG cards) and findable via search (meta + sitemap).
- Strong Lighthouse/accessibility scores that back up the technical positioning.

## Non-goals (v1)

- No CMS/database — project content is hardcoded, typed TypeScript.
- No contact form / email backend — direct links only.
- No résumé PDF in v1 (rely on LinkedIn + the case study; add later).
- No blog, no dedicated About page, no auth, no i18n.
- No "coming soon" placeholder projects (ship one excellent case study; design for more).

## Positioning & decisions summary

| Decision | Choice |
|---|---|
| Audience | Both, recruiter-leaning |
| Content model | Hardcoded typed TS in `src/content/` (mirrors the barber-shop repo's `src/content/` pattern) |
| Project depth | Rich cards on an index + a moderate detail page per project |
| Aesthetic | Fresh, minimal/technical (discard island/sea theme) |
| Theme | System preference default + manual toggle, no-flash SSR |
| Contact | Direct links (email, GitHub, LinkedIn); no form, no résumé v1 |
| Project media | Curated screenshots gallery |
| Images | Build-time optimization via `vite-imagetools` (responsive WebP/AVIF) |
| SEO/analytics | Per-page meta + OG images, `sitemap.xml` + `robots.txt`, Vercel Analytics |
| Deployment | Vercel |

## Information architecture (routes)

File-based routes under `src/routes/`:

- `/` — **Home**: hero + one-line positioning, featured project (Chavo's Parlor) given hero treatment so the site never feels empty, a compact skills/stack strip, and a contact CTA footer.
- `/projects` — **Projects index**: responsive grid of project cards (one card in v1). Each card: title, one-line blurb, stack tags, thumbnail, links to detail + live/repo.
- `/projects/$slug` — **Project detail**: the case study. `$slug` resolves against the hardcoded projects data; unknown slug → 404 via router `notFoundComponent`.
- Contact is a **section** on Home (and repeated in the global footer), not a separate route.
- `__root.tsx` — document shell: header/nav (Home, Projects, contact links), theme toggle, footer, global head/meta defaults, `<HeadContent>`, `<Scripts>`. Update the default title/meta away from "TanStack Start Starter".

## Content / data model

New `src/content/` directory, hardcoded and typed (pattern proven in the barber-shop repo):

- `src/content/projects.ts` — array of `Project`. Suggested type:
  ```ts
  type Project = {
    slug: string;
    title: string;
    tagline: string;            // one-line blurb for cards
    role: string;               // e.g. "Design & full-stack build"
    year: string;
    stack: string[];            // tag chips
    liveUrl?: string;           // omit/disable if not publicly linkable
    repoUrl?: string;
    featured: boolean;          // drives Home hero
    summary: string;            // short intro paragraph
    problem: string;
    approach: string;           // narrative; may include tradeoffs
    highlights: { title: string; body: string }[];  // technical wins
    outcomes: string[];         // proof points
    testimonial?: { quote: string; author: string };
    gallery: { src: string; alt: string; caption?: string }[];
  };
  ```
- `src/content/site.ts` — name, headline, short bio, social links (email, GitHub, LinkedIn), nav config.

Rendering: a helper (`getProject(slug)` / `getAllProjects()`) keeps routes thin. No server functions needed — this is static data; pages can be prerendered.

## Flagship case study content — Chavo's Parlor

Grounded in the real project at `/Users/kennethrathbun/Documents/projects/barber-shop`. **It is live in production** — a real, deployed client site for a real shop (the `SQUARE_ENV=sandbox` flag seen in the repo is a stale spec marker, not the live state). Frame it plainly as a shipped client project. Capture the **live production URL** for the `liveUrl` field so the detail page and card link to the real site (grab it from the client/Vercel dashboard during implementation).

- **Title / role / year:** Chavo's Parlor — custom barber-shop booking site · Design & full-stack build · 2026.
- **Tagline:** "A branded, faster booking experience that replaces a generic Square page — with Square kept as the source of truth."
- **Stack tags:** TanStack Start, React 19, TypeScript, Tailwind v4, Square SDK, Zod, Vitest, Playwright, Vercel.
- **Problem:** the shop relied on a generic hosted Square booking page — off-brand, slower, no control over UX or performance.
- **Approach / narrative:** branded TanStack Start site with a strict server/client boundary (pure logic in `src/domain/`, all Square IO isolated in `src/server/`); Square remains system of record (no custom DB) to minimize operational risk; env-driven cutover (`SQUARE_ENV`, `BOOKING_MODE`) so hosted↔custom booking and sandbox↔production are config flips, not code changes.
- **Technical highlights (the brag list):**
  - **Idempotent booking saga** — deterministic v2 idempotency key derived from normalized contact info so double-taps/retries never double-book; slot-conflict detection by Square category+code.
  - **Deposits saga** — authorize (hold) → book → capture; void on booking failure; capture failure never cancels the booking (emits reconciliation alert + seller note).
  - **URL-as-state booking wizard** — entire 4-step flow lives in validated URL search params, so refresh/back/shared links stay consistent.
  - **Resilience / fail-open** — live Square Catalog fetch falls back to a placeholder menu so the page never blanks; env is Zod-validated at server start.
  - **Privacy & security** — PII sanitizer keeps email/phone out of logs; honeypot spam rejection; self-hosted static map (zero third-party requests / no tracking); strict security headers (HSTS, nosniff, X-Frame-Options DENY, Permissions-Policy).
  - **Performance** — preloaded above-the-fold woff2 fonts, `fetchPriority="high"` hero, lazy gallery/map, WebP assets, `fontaine` fallback metrics to kill layout shift.
  - **Accessibility** — automated axe-core gate, oklch colors tuned to WCAG AA/AAA, visible focus, `prefers-reduced-motion`.
  - **Correctness** — availability rendered in shop timezone (America/Los_Angeles) across PST/PDT using only native `Intl`, no date lib.
- **Outcomes / proof:** live in production for the shop; 5.0★ across 61 Google reviews (aggregate, captured 2026-06-30); testimonial quote available (e.g. "the best barber in San Diego County"); 37 test files (Vitest + Playwright + axe-core) as evidence of rigor. *(No Lighthouse/analytics numbers are wired yet — cite build quality and testing, not fabricated metrics.)*
- **Gallery:** **fresh UI captures** of the running barber-shop app — hero, services menu, gallery section, and the booking wizard steps. (Chavo's real photo assets exist in the repo but v1 uses clean app screenshots for consistent framing.)

## Design system (fresh, minimal/technical)

Replace the island/sea theme in `src/styles.css`. Direction:

- **Palette:** restrained neutral base (zinc/slate) with a single accent; oklch tokens (consistent with shadcn + the barber-shop approach). Both light and dark defined.
- **Type:** a clean sans for body/UI and a mono accent for technical detail (labels, stack chips, section kickers) to signal "engineer." Self-host via `@fontsource` (as the barber shop does) rather than runtime Google Fonts import.
- **Components:** install shadcn/ui primitives as needed (button, card, badge, separator, navigation-menu/sheet for mobile nav) via `pnpm dlx shadcn@latest add <x>` → lands in `src/components/ui/`. Custom composed components in `src/components/` (e.g. `project-card`, `hero`, `stack-strip`, `gallery`, `theme-toggle`, `site-header`, `site-footer`).
- **Motion:** subtle only (fade/rise on scroll), fully gated behind `prefers-reduced-motion`.

## Theme (system + toggle)

- Provider that reads OS preference by default and allows manual light/dark override persisted to `localStorage`.
- **No-flash SSR:** inline a tiny blocking script in `__root.tsx` `<head>` that sets the `.dark` class from stored/system preference before paint (the `@custom-variant dark (&:is(.dark *))` already exists in `styles.css`). Toggle control lives in the header.

## Images

- Add **`vite-imagetools`** to `vite.config.ts`. Author gallery/thumbnail images to generate responsive optimized WebP/AVIF at build with explicit width/height (prevents CLS) and lazy loading below the fold; eager + high priority for the Home hero.
- Store source images under `src/assets/` (imagetools-processed) or `public/` for static passthrough; pick one convention and document it. Capture fresh barber-shop screenshots into that location.

## SEO, social, analytics

- **Per-route meta** via each route's `head()` (title + description); sensible defaults in `__root.tsx`. Reuse the barber-shop pattern.
- **Open Graph + Twitter `summary_large_image`** tags; provide an OG image (site-level, plus per-project if feasible).
- **`sitemap.xml` + `robots.txt`** generated for the known routes.
- **Vercel Analytics** (`@vercel/analytics`) — one component, no cookie banner needed.

## Dependencies to add

- `vite-imagetools` (dev) + config.
- shadcn/ui component packages (Radix primitives) as pulled in by the CLI.
- `@fontsource/*` for the chosen fonts.
- `@vercel/analytics`.
- (Everything else — TanStack Start, Tailwind v4, biome, vitest — already present.)

## Accessibility & performance targets

- Keyboard-navigable, visible focus, semantic landmarks, alt text on all gallery images.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Target Lighthouse ≥ 95 across Performance/Accessibility/Best-Practices/SEO on Home and a project detail page.
- No layout shift on image/font load.

## Deployment

- **Vercel**, TanStack Start's Nitro Vercel preset. Static/prerendered where possible since content is hardcoded. Enable Vercel Analytics in project settings.

## Out of scope / future

- Additional projects (data model already supports them), résumé PDF, contact form + email provider, blog/writing, per-project OG image automation, live-site embeds, booking-funnel analytics.

## Open items to confirm before/at implementation

1. Grab the **live production URL** for Chavo's Parlor to populate `liveUrl`.
2. Confirm the **testimonial quote + attribution** to display (owner/client permission).
3. Final **accent color** and **font pairing** for the technical aesthetic (can be decided during implementation with a quick preview).
4. GitHub/LinkedIn/email handles for `site.ts`.

## Verification

- `pnpm dev` — Home, `/projects`, `/projects/chavos-parlor` render; nav + theme toggle work; no hydration/theme flash.
- Theme toggle persists across reload; respects OS default on first visit.
- `pnpm build` succeeds; images emit optimized WebP/AVIF with dimensions.
- View-source / social debugger shows correct per-page title, description, OG image; `sitemap.xml` + `robots.txt` served.
- `pnpm check` (Biome) and `pnpm test` pass; add smoke tests for `getProject` and 404 on unknown slug.
- Lighthouse run on Home + project detail meets targets.
- Cross-check every barber-shop claim in the case study against the real repo; frame it as a live, shipped client project and confirm the live URL resolves.
