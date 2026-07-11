# Handoff changelog

One row per file in this directory. Update status as work moves; see
`README.md` for the lifecycle. Agents may mark a row `done` themselves once
the handoff's verification checklist genuinely passes — use `needs-review`
instead when unsure or when it needs Ken's judgment call.

| Date | Handoff | From → To | Status | Notes |
|---|---|---|---|---|
| 2026-07-10 | [home-color-contrast](2026-07-10-home-color-contrast.md) | Claude → Codex | in-progress | Fix 2 (badge `green-800`) landed — `src/content/projects.ts:36`. Fix 1 (glass button ink) not yet applied — `ui-library`'s compiled `dist/ui-library.js` still hardcodes `"ui-btn-glass-colored text-white"`. |
| 2026-07-11 | [glass-button-label-layout](2026-07-11-glass-button-label-layout.md) | Claude → Codex | done | Fixed in `../ui-library` and rebuilt: hero/contact buttons are 44px, project-card button is 36px, with single-line labels and 8px gaps in both themes. Both repos' tests/typechecks pass; Storybook builds; hero rest/hover contrast passes AA (worst 9.27:1). |
