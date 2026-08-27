# Repository Guidelines

## Project Agent and Instruction Authority

Codex is the primary coding agent for this repository. `AGENTS.md` is the only
repository-wide instruction file loaded automatically. Narrow skill
instructions and task-relevant documents remain conditional; do not create or
maintain provider-specific mirrors unless Kenneth explicitly asks for one.

`SPEC.md` owns enduring product outcomes, and `CONTEXT.md` owns domain
language. See `docs/README.md` for the documentation authority and lifecycle
model; document location alone never makes a file current guidance.

## Working Approach

Adapt the work to its uncertainty and consequences:

- For clear, reversible work, implement the smallest complete slice directly.
- For uncertain or experiential work, inspect current behavior and gather the
  smallest evidence that can answer the question. Use a rendered experiment or
  prototype only when inspection cannot answer it, and keep it narrow.
- For hard-to-reverse, high-consequence, or high-blast-radius work, investigate
  first and surface meaningful tradeoffs before committing to a direction.
- Treat plans as hypotheses. Revise or abandon them when implementation or
  rendered evidence contradicts their assumptions.
- Keep task-specific acceptance criteria in the task by default. Persist them
  only when Kenneth asks or continuity across tasks genuinely requires it.
- Use deterministic checks to protect durable, consequential, or
  regression-prone behavior. Move recurring objective failures into types,
  tests, scripts, or CI instead of duplicating prose already enforced by tools.
  Do not encode a subjective one-off preference as a permanent test.
- Scale verification with uncertainty, consequence, blast radius,
  observability, recoverability, and external state.

Request owner input only when unresolved, materially different choices remain.
An explicit Kenneth choice is authorization to proceed without reconfirmation,
including when the choice is durable. Follow `docs/README.md` for whether and
where to record it. Experiments remain non-durable.

## Project Structure & Module Organization

This portfolio is a TanStack Start/React 19 application. File-based pages live
in `src/routes/`. Keep each non-root route in a directory named for its route
segment and use `route.tsx` (`route.ts` for a server-only route) for the route
at that segment. Use `index.tsx` only for a genuine index route. `__root.tsx`
and the root `index.tsx` remain at the routes root as TanStack special cases.
Prefix colocated non-route files with `-` so the route generator ignores them.
`__root.tsx` provides the document shell, and `routeTree.gen.ts` is
generated—never edit it manually. Reusable application components belong in
`src/components/`, while shadcn primitives belong in `src/components/ui/`.
Keep typed portfolio data in `src/content/`, shared helpers in `src/lib/`, and
global Tailwind v4 styles and theme variables in `src/styles.css`.

Place project screenshots under `src/assets/<project-id>/`, import them with the
appropriate imagetools query in `src/content/projects.ts`, and store the
resulting pictures directly on the project content. Static, unprocessed files
such as icons and fonts live in `public/`. Tests are colocated with their
subjects as `src/**/*.test.ts` or `.test.tsx`.

## Build, Test, and Development Commands

Use pnpm, as pinned in `package.json`, and use the scripts there as the command
source of truth. During iteration, run the smallest focused checks that can
falsify the change. For changes affecting production output, routing,
dependencies, or build configuration, `pnpm build` is the required completion
gate because its `prebuild` runs type checking, tests, and Biome before the
production build. Documentation- and reference-only changes receive
proportionate validation. Run `pnpm generate-routes` after changing file-based
routes; never edit the generated route tree manually.

## Coding Style & Naming Conventions

Biome enforces formatting, lint rules, and organized imports. TypeScript is
strict; use `import type` for type-only dependencies. Name React component
files with lowercase kebab-case (for example, `project-card.tsx`), export
components in PascalCase, and use camelCase for functions and variables.
Prefer the `#/*` alias for imports from `src/`.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commits, typically
`type(scope): imperative summary`, such as
`fix(github): scale contribution graph to container`. Use `feat`, `fix`,
`refactor`, `test`, or `chore` with a focused scope. Pull requests should
explain the change and verification performed, link relevant issues or
authoritative decisions, and include before/after screenshots for visual
changes. Keep generated files and related tests in the same change when
applicable.

## Agent Skills

Reusable procedures live in `.agents/skills/`. Read the relevant `SKILL.md`
before doing this kind of work — these exist so you don't have to guess.

- **`.agents/skills/run-ts-portfolio/`** — start the dev server and drive the
  real site with the available browser integration; its local Playwright REPL
  is an optional fallback when that dependency is already available. Navigate,
  screenshot, click, read the DOM, and check the console. **Use this before
  making or reviewing claims about rendered appearance, geometry, responsive
  media selection, or interactions.** Reviewing rendered UI from source alone
  produces confident, wrong answers about centering, image `sizes`, and
  `object-fit`; measure it instead.
- **`.agents/skills/verify-contrast/`** — measure real WCAG contrast from
  rendered pixels. Required for translucent, gradient, `backdrop-filter`, or
  otherwise non-solid backgrounds, where a CSS-color contrast calculator
  cannot give a truthful number.
- **`.agents/skills/tanstack-start/`** — establish the installed and upstream
  TanStack Start/Router baselines before implementing, reviewing, or making
  version-sensitive API claims. Use it for all TanStack Start and Router work.
