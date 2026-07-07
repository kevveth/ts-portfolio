# ts-portfolio

Personal portfolio site for Kenneth Rathbun, a full-stack developer. Built with [TanStack Start](https://tanstack.com/start) (React 19 SSR) using file-based routing, Tailwind CSS v4, and shadcn/ui. Deployed on Vercel.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:3000.

## Scripts

```bash
npm run dev              # Dev server on port 3000
npm run build            # Production build (vite build)
npm run test             # Run tests (vitest run)
npm run typecheck        # Type-check with tsc --noEmit
npm run lint             # Biome lint
npm run format           # Biome format (writes changes)
npm run check            # Biome lint + format check
npm run generate-routes  # Regenerate routeTree.gen.ts
```

## Structure

- `src/routes/` — file-based routes; `__root.tsx` is the document shell. Adding a file regenerates `src/routeTree.gen.ts` automatically.
- `src/components/` — UI components; `src/components/ui/` holds shadcn/ui primitives.
- `src/content/` — typed site and project content (`site.ts`, `projects.ts`).
- `src/lib/` — helpers (`utils.ts`, `theme.ts`, `project-images.ts`).
- `src/styles.css` — Tailwind v4 theme via CSS variables (no config file).

## Adding a shadcn/ui component

```bash
npx shadcn@latest add <component>
```

## Adding a project

Add an entry to `src/content/projects.ts` and register its images in `src/lib/project-images.ts`, with the source images under `src/assets/<slug>/`.
