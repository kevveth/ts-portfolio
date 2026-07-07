# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A portfolio site built on TanStack Start (React SSR framework) with file-based routing, Tailwind CSS v4, and shadcn/ui.

## Commands

```bash
npm run dev              # Dev server on port 3000
npm run build            # Production build (vite build)
npm run test             # Run all tests (vitest run)
npm run typecheck        # Type-check with tsc --noEmit
npx vitest run <path>    # Run a single test file
npm run lint             # Biome lint
npm run format           # Biome format
npm run check            # Biome lint + format combined
npm run generate-routes  # Regenerate routeTree.gen.ts (tsr generate)
```

Add shadcn/ui components with the latest shadcn CLI (per .cursorrules):

```bash
npx shadcn@latest add <component>
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
