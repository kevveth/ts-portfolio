# Repository Guidelines

## Product direction

- Freelance clients are the primary audience. Help them understand the service,
  inspect shipped work, and contact Kenneth with minimal friction.
- Build credibility through useful business websites, reliable delivery, and
  supported outcomes. Chavo's Parlor is the primary case study.
- Check case-study claims against the actual project or dated evidence. Do not
  invent booking, revenue, conversion, performance, or other business results.
- Keep public information accessible without accounts, app installs, or personal
  data. Collect only what the requested service needs.
- Preserve accessible navigation, responsive layouts, and consistent light/dark
  themes. The presentation should help visitors understand the business offer.

## Working approach and continuity

Codex is the primary coding agent. Keep repository-wide guidance here; add
instructions or skills only for a demonstrated recurring need.

- Follow Kenneth's current direction. Implement clear, reversible work in small,
  complete slices; investigate meaningful uncertainty before choosing a solution.
- Ask only about unresolved choices that materially change the result. An
  explicit choice authorizes that work without repeated confirmation.
- Keep task plans in the conversation unless continuity genuinely needs a file.
  Persisted plans require Kenneth's approved scope, an owner, and active status;
  completed plans and editorial drafts are references, not a queue of work.
- Use root `SAVE.md` as the temporary, untracked session handoff. On a save
  request, record unfinished work, checks, next steps, and unresolved decisions;
  link to Git and durable docs instead of repeating them. Never save secrets.
  On load/continue, compare the saved branch and commit with current Git state.
- Keep relevant operational knowledge with its feature, such as
  `docs/contact-setup.md`. Avoid duplicate specifications and generic checklists.

## Project conventions

This is a TanStack Start/React application. Use pnpm as pinned in `package.json`;
that file owns executable commands and dependency versions.

- Pages live in `src/routes/<segment>/route.tsx` (`route.ts` for server-only
  routes). Use `index.tsx` for genuine index routes; the root `index.tsx` and
  `__root.tsx` are framework exceptions. Prefix colocated helpers/tests with `-`.
- `src/routeTree.gen.ts` is generated. Run `pnpm generate-routes` after changing
  route files; never edit the generated tree manually.
- Shared UI belongs in `src/components/`, shadcn primitives in
  `src/components/ui/`, typed site/project data in `src/content/`, helpers in
  `src/lib/`, and global styles/theme variables in `src/styles.css`.
- Put project screenshots in `src/assets/<project-id>/` and import their
  imagetools pictures in `src/content/projects.ts`. Unprocessed assets belong
  in `public/`. Colocate tests as `*.test.ts` or `*.test.tsx`.
- Follow Biome and strict TypeScript. Use `import type`, kebab-case filenames,
  PascalCase components, and the `#/*` source alias.

## Verification

- During iteration, run focused checks relevant to the change. Tests should
  protect consequential behavior rather than freeze subjective styling.
- For production code, routing, dependency, or build changes, run `pnpm build`
  once at completion; its prebuild already runs types, tests, and Biome.
  Documentation-only edits need link/content checks, not a production build.
- For visual or interaction changes, inspect the affected page in a browser at
  relevant viewport/theme states. Expand to shared journeys when shared UI
  changes. Recheck passing work only after new changes or unresolved evidence.
- External delivery and deployed controls need their own relevant verification;
  a local build or mocked transport does not establish live behavior.

## Focused skills

Read a skill only when its trigger applies:

- `.agents/skills/run-ts-portfolio/`: start/reuse the dev server and inspect
  affected rendered UI. It owns browser checks, not every development gate.
- `.agents/skills/tanstack-start/`: framework API uncertainty, routing/server
  behavior changes, or upgrades. Routine copy/CSS changes do not need research.

Use focused Conventional Commits. PRs explain the result and verification, with
before/after screenshots for visual changes. Keep the existing PR and preview
workflow; record explicit workflow changes rather than inferring them.
