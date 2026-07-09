# Project Context — ts-portfolio

> Generated 2026-07-08 by map-codebase. 43 source files, 2 git commits.

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | **TanStack Start** (React SSR) | latest |
| Runtime | React 19 / React DOM 19 | ^19.2.0 |
| Language | TypeScript | ^6.0.2 |
| Styling | Tailwind CSS v4 | ^4.1.18 |
| UI primitives | shadcn/ui (new-york style, zinc base) | — |
| Icons | lucide-react | ^0.577.0 |
| Class merging | clsx + tailwind-merge + cva | — |
| Validation | Zod | ^4.4.3 |
| Build | Vite 8 | ^8.0.0 |
| Lint/Format | Biome 2.4.5 (tab indent, double quotes) | 2.4.5 |
| Test runner | Vitest 4 (node environment) | ^4.1.5 |
| Test utils | @testing-library/react + jest-dom | — |
| E2E (installed, no tests) | Playwright | ^1.61.1 |
| Image pipeline | vite-imagetools (multi-format, srcset) | ^10.0.1 |
| Font pipeline | fontaine (metric-matched fallbacks) | ^0.8.0 |
| Fonts | IBM Plex Sans + IBM Plex Mono (self-hosted woff2) | ^5.2.x |
| Analytics | @vercel/analytics | ^2.0.1 |
| A11y | axe-core | ^4.12.1 |
| Agent Skills | @tanstack/intent (CLI) | ^0.3.5 |
| Package mgr | pnpm | 11.6.0 |
| Deploy | Vercel (via nitro adapter) | — |

## Architecture

### High-Level Pattern

```
src/
├── content/          ← Pure data modules (no side effects, no app imports)
│   ├── site.ts       ← SITE identity, nav, skills, meta
│   └── projects.ts   ← Project case studies, typed Project[] array
├── lib/              ← Utility modules (leaf dependencies only)
│   ├── utils.ts      ← cn() (clsx + twMerge)
│   ├── theme.ts      ← Theme init script, localStorage helpers
│   └── project-images.ts ← Image import registry (build-time optimized)
├── components/       ← Presentational components
│   ├── ui/           ← shadcn/ui primitives (button, card, badge, separator, sheet)
│   └── *.tsx         ← App components (hero, section, reveal, gallery, etc.)
├── routes/           ← TanStack Start file-based routes
│   ├── __root.tsx    ← Document shell: <html>, <head>, <body>, devtools
│   ├── index.tsx     ← Home page (Hero → FeaturedProject → StackStrip → ContactCta)
│   ├── projects.index.tsx  ← Projects listing (grid of ProjectCards)
│   └── projects.$slug.tsx  ← Project detail (case study layout)
└── assets/           ← Static images per project (chavos-parlor/)
```

### Data Flow

1. **Content (source of truth):** `src/content/` exports typed, dependency-free data modules. Site identity is `SITE` constant; projects are a `Project[]` array with getter functions (`getAllProjects`, `getProject`, `getFeaturedProject`). Content modules import nothing from `#/` — they're pure leaf modules usable by client, server, and test.

2. **Image registry:** `src/lib/project-images.ts` imports vite-imagetools-processed images and maps string keys → `ImagetoolsPicture` objects. Content modules store string keys; components resolve them via `getProjectImage(key)` / `getProjectThumb(slug)`.

3. **Routes → Components → Content:** Routes pull data from content layer at load time (via loader in `$slug`), no async server functions. Components read content + image registry directly.

4. **Theme pipeline:** Pre-paint `<script>` in `<head>` (via `THEME_INIT_SCRIPT`) → reads localStorage or system preference → applies `.dark` class before first paint → React components (ThemeToggle) read/write the same key. SSR never sends theme-specific content — icons use `dark:hidden` / `hidden dark:block` CSS to avoid hydration mismatch.

### Client/Server Boundaries

- **"use client" directive:** Only on `SiteHeader` (interactive sheet menu). Other components render statically on both sides.
- **Server handlers:** Only `robots[.]txt.tsx` uses `server.handlers` (returns plain text response). No other API routes or server functions.
- **SSR strategy:** Fully pre-rendered (static + sitemap via TanStack Start's `prerender`). No runtime server data fetching — content is compile-time known.

## Conventions (Observed)

### Error Handling
- TypeScript `strict` mode: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`
- `verbatimModuleSyntax` enforces `import type` for type-only imports
- Content validation via Vitest tests (slug format, required fields, status validity, alt text)
- `getFeaturedProject()` throws if no project is marked featured
- `getProjectImage()` / `getProjectThumb()` throw for unregistered keys
- No global error boundary, no structured error logging, no health check

### API Design
- Static SSR only — no REST/GraphQL/RPC endpoints
- One server handler (robots.txt → `text/plain` response)
- Meta/OG tags defined per route via `head()` callback

### Type Safety
- **Strict throughout.** Zero `any` usage in app code (grep confirms). Discriminated unions for `ProjectStatus`. `as const satisfies` on constants.
- Ambient module declarations for imagetools marker imports (`*?hero`, `*?gallery`, `*?thumb`)
- Router types registered globally via `declare module "@tanstack/react-router"`

### Styling
- Tailwind v4 with CSS variables in `src/styles.css`
- shadcn/ui `new-york` style, `zinc` base
- `cn()` helper wraps clsx + tailwind-merge for all className composition
- Dark mode via `.dark` class on `<html>` (not media query — user-toggleable)
- `reveal` class for scroll animations (hidden under `html.js`, static for no-JS/prefers-reduced-motion)
- Prose plugin: `@tailwindcss/typography`
- Animation plugin: `tw-animate-css`

### Testing
- **Environment:** Node (not jsdom) — tests run against pure data modules
- **Coverage:** `src/content/projects.test.ts` (7 tests) validates project data integrity
- **Setup:** `src/test/setup.ts` loads `@testing-library/jest-dom/vitest`
- **Pattern:** Vitest `describe`/`it` blocks, no mocks needed (pure data)
- **Gaps:** No component tests, no Playwright/e2e tests (Playwright is installed but unused), no a11y checks wired to test suite

### Naming & Structure
- kebab-case filenames (`project-card.tsx`, `contact-links.tsx`)
- PascalCase React components (`ProjectCard`, `ContactLinks`)
- `#/` path alias (maps to `src/`) used consistently
- shadcn components in `src/components/ui/`

## Signals / Active Considerations

### Gaps
1. **No component tests.** Content-only tests leave UI logic untested. Playwright is in devDeps but no e2e or screenshot tests exist. axe-core is installed but not wired to any test runner.

2. **No error boundary.** TypeScript catches compile-time issues but runtime errors (e.g. failed image imports) have no React boundary. The site has no `<ErrorBoundary>` component.

3. **Content-light.** Only 1 project (Chavo's Parlor). The site structure supports multiple but the content layer is thin. Adding a second project is manual: edit `projects.ts` + add images to `assets/<slug>/` + register in `project-images.ts`.

4. **No observability.** Zero structured logging, no health check endpoint, no error tracking. Vercel Analytics is the only telemetry.

5. **No CI pipeline.** No GitHub Actions, no pre-commit hooks, no deployment automations defined.

6. **CONVENTIONS.md missing.** Only CLAUDE.md exists; no structured agent convention file.

### Debt Hotspots
1. **Image registration is manual.** Adding a project requires touching three files (`projects.ts`, image assets, `project-images.ts`). No automation or validation that keys match between content and registry.

2. **Single-project design.** `getFeaturedProject()` assumes exactly one featured project exists. Gallery, hero, and detail page are all built for the one-project case — scaling to multiple projects may surface edge cases.

3. **Package manager pin.** The `packageManager` field in `package.json` (unstaged diff) locks to pnpm 11.6.0 — this can break contributors on different versions.

### Integration Points
- **Square SDK:** Referenced in skills but not used in this repo (the portfolio site has no Square integration — that's the *referenced* project's dependency)
- **Vercel:** Production deploy target; `VERCEL_PROJECT_PRODUCTION_URL` env var drives sitemap + meta URLs
- **Fontaine / imagetools:** Build-time plugins that process fonts and images; test vitest config stubs imagetools imports

### Current State (2026-07-08)
- 2 commits on `main`: initial scaffold + run-ts-portfolio skill
- `package.json` has an unstaged diff (packageManager field added)
- `specs/` directory is newly scaffolded (untracked)
- `active_story: e24s03` — no corresponding epic capsule exists yet
