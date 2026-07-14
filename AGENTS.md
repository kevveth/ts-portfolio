# Repository Guidelines

## Project Structure & Module Organization

This portfolio is a TanStack Start/React 19 application. File-based pages live in `src/routes/`; `__root.tsx` provides the document shell, and `routeTree.gen.ts` is generated—never edit it manually. Reusable application components belong in `src/components/`, while shadcn primitives belong in `src/components/ui/`. Keep typed portfolio data in `src/content/`, shared helpers in `src/lib/`, and global Tailwind v4 styles and theme variables in `src/styles.css`.

Place project screenshots under `src/assets/<project-slug>/` and register them in `src/lib/project-images.ts`. Static, unprocessed files such as icons and fonts live in `public/`. Tests are colocated with their subjects as `src/**/*.test.ts` or `.test.tsx`. Product and architecture records are maintained in `specs/` and `docs/`.

## Build, Test, and Development Commands

Use pnpm, as pinned in `package.json`.

- `pnpm install` installs dependencies from `pnpm-lock.yaml`.
- `pnpm exec vite --port 3000` starts the local development server.
- `pnpm build` creates the production Vite build.
- `pnpm preview` serves the production build locally.
- `pnpm test` runs the Vitest suite once.
- `pnpm typecheck` runs strict TypeScript checks without emitting files.
- `pnpm check` runs Biome formatting and lint checks; `pnpm format` applies formatting.
- `pnpm generate-routes` regenerates `src/routeTree.gen.ts` when needed.

## Coding Style & Naming Conventions

Biome enforces tab indentation, double quotes, recommended lint rules, and organized imports. TypeScript is strict; use `import type` for type-only dependencies. Name React component files with lowercase kebab-case (for example, `project-card.tsx`), export components in PascalCase, and use camelCase for functions and variables. Prefer the `#/*` alias for imports from `src/`.

## Testing Guidelines

Vitest discovers colocated `*.test.ts` and `*.test.tsx` files and loads `src/test/setup.ts`. Add focused tests for content contracts, helpers, and rendered component behavior. Run one file with `pnpm exec vitest run src/lib/github.test.ts`; before submitting, run `pnpm test`, `pnpm typecheck`, and `pnpm check`.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commits, typically `type(scope): imperative summary`, such as `fix(github): scale contribution graph to container`. Use `feat`, `fix`, `refactor`, `test`, or `chore` with a focused scope. Pull requests should explain the change and verification performed, link relevant issues or specs, and include before/after screenshots for visual changes. Keep generated files and related tests in the same change when applicable.

## Agent Skills

Reusable procedures live in `.agents/skills/`. Read the relevant `SKILL.md`
before doing this kind of work — these exist so you don't have to guess.

- **`.agents/skills/run-ts-portfolio/`** — start the dev server and drive the
  real site in Chromium via a Playwright REPL (`driver.mjs`): navigate,
  screenshot, click, read the DOM, check the console. **Use this before making
  or reviewing any UI/layout claim.** Reviewing rendered UI from source alone
  produces confident, wrong answers about centering, image `sizes`, and
  `object-fit`; measure it instead.
- **`.agents/skills/verify-contrast/`** — measure real WCAG contrast from
  rendered pixels. Required for translucent, gradient, `backdrop-filter`, or
  otherwise non-solid backgrounds, where a CSS-color contrast calculator
  cannot give a truthful number.

## Agent Handoffs

Async handoffs between agents (e.g. Claude → Codex) live in `docs/handoffs/`.
If you're picking up work here, check `docs/handoffs/CHANGELOG.md` for
anything `open` or `in-progress` addressed to you. If you're stopping
mid-task and want another agent to continue, copy `docs/handoffs/TEMPLATE.md`
and add a row to the changelog. Run the handoff's verification checklist and
mark it `done` yourself once it genuinely passes — use `needs-review` instead
if you're unsure or the call is genuinely Ken's to make.
