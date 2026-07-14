# ts-portfolio

Personal portfolio site for Kenneth Rathbun, a full-stack developer. Built with [TanStack Start](https://tanstack.com/start) (React 19 SSR) using file-based routing, Tailwind CSS v4, and shadcn/ui. Deployed on Vercel.

## Getting started

This project uses **pnpm** (pinned via `packageManager` in `package.json`). `pnpm-lock.yaml` is the only lockfile — don't run `npm install`, which would add a competing `package-lock.json`.

```bash
pnpm install
pnpm dev
```

The dev server runs on http://localhost:3000.

## Scripts

```bash
pnpm dev                 # Dev server on port 3000
pnpm build               # Production build (vite build)
pnpm test                # Run tests (vitest run)
pnpm typecheck           # Type-check with tsc --noEmit
pnpm lint                # Biome lint
pnpm format              # Biome format (writes changes)
pnpm check               # Biome lint + format check
pnpm generate-routes     # Regenerate routeTree.gen.ts
```

## Structure

- `src/routes/` — file-based routes; `__root.tsx` is the document shell. Adding a file regenerates `src/routeTree.gen.ts` automatically.
- `src/components/` — UI components; `src/components/ui/` holds shadcn/ui primitives.
- `src/content/` — typed site and project content (`site.ts`, `projects.ts`).
- `src/lib/` — helpers (`utils.ts`, `theme.ts`, `project-images.ts`).
- `src/styles.css` — Tailwind v4 theme via CSS variables (no config file).

## Adding a shadcn/ui component

```bash
pnpm dlx shadcn@latest add <component>
```

## Adding a project

Add an entry to `src/content/projects.ts` and register its images in `src/lib/project-images.ts`, with the source images under `src/assets/<slug>/`.
