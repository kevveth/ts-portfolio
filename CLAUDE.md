# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A portfolio site built on TanStack Start (React SSR framework) with file-based routing, Tailwind CSS v4, and shadcn/ui.

## Commands

**This repo is pnpm-only** — `package.json` pins `pnpm@11.6.0` via `packageManager`, and `pnpm-lock.yaml` is the single source of truth. Never run `npm install`/`npx` here: npm writes a competing `package-lock.json`, which is what previously left the repo with two conflicting lockfiles and made Vercel's package-manager detection ambiguous. Use `pnpm` and `pnpm exec` (or `pnpm dlx` for one-off CLIs).

```bash
pnpm install                 # Install deps from pnpm-lock.yaml
pnpm dev                     # Dev server on port 3000
pnpm build                   # Production build (vite build)
pnpm test                    # Run all tests (vitest run)
pnpm typecheck               # Type-check with tsc --noEmit
pnpm exec vitest run <path>  # Run a single test file
pnpm lint                    # Biome lint
pnpm format                  # Biome format
pnpm check                   # Biome lint + format combined
pnpm generate-routes         # Regenerate routeTree.gen.ts (tsr generate)
```

Add shadcn/ui components with the latest shadcn CLI (per .cursorrules):

```bash
pnpm dlx shadcn@latest add <component>
```

## Architecture

- **TanStack Start + Router, file-based routing.** Routes live in `src/routes/`; adding a file there creates a route, and the plugin regenerates `src/routeTree.gen.ts` automatically (never edit it by hand — it's excluded from Biome). `src/routes/__root.tsx` is the document shell (`shellComponent`) that wraps every route and hosts `<HeadContent>`, `<Scripts>`, and the devtools panel. `src/router.tsx` exports `getRouter()` and registers the router type globally.
- **Path aliases:** `#/*` and `@/*` both map to `src/*` (tsconfig `paths` + Node `imports` in package.json). shadcn's `components.json` uses the `#/` form (`#/components`, `#/lib/utils`, etc.), so generated components land in `src/components/ui/`.
- **Styling:** Tailwind v4 via the `@tailwindcss/vite` plugin — no tailwind.config file; theme lives in `src/styles.css` (CSS variables, zinc base, new-york shadcn style). `cn()` helper is in `src/lib/utils.ts`.
- **Server code:** TanStack Start server functions (`createServerFn` from `@tanstack/react-start`) and API routes (a route file's `server.handlers`) run server-side; there is no separate backend.

## Conventions

- Biome is the formatter/linter: tab indentation, double quotes. It only covers `src/`, `vite.config.ts`, `vitest.config.ts`, and `.vscode/`; `routeTree.gen.ts` and `styles.css` are excluded.
- TypeScript is strict with `verbatimModuleSyntax` — use `import type` for type-only imports.
- Files prefixed with `demo` are scaffold examples and safe to delete.
- `docs/spec-driven-development-with-claude-code.md` describes the spec-driven workflow the owner intends to follow (spec → plan → implement → verify, reviewing at phase gates).
- Cross-agent handoffs (e.g. Claude → Codex) live in `docs/handoffs/`. Register every one in `docs/handoffs/CHANGELOG.md`; see `docs/handoffs/README.md` for the status lifecycle. Agents may mark a row `done` themselves once its verification checklist genuinely passes — use `needs-review` when unsure or when it's Ken's call.
