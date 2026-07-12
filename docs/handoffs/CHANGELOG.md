# Handoff changelog

One row per file in this directory. Update status as work moves; see
`README.md` for the lifecycle. Agents may mark a row `done` themselves once
the handoff's verification checklist genuinely passes — use `needs-review`
instead when unsure or when it needs Ken's judgment call.

| Date | Handoff | From → To | Status | Notes |
|---|---|---|---|---|
| 2026-07-10 | [home-color-contrast](2026-07-10-home-color-contrast.md) | Claude → Codex | done | Both fixes landed. Colored-glass ink now lives in `ui-library` with light/dark/reduced-transparency handling; the portfolio override was removed. All 24 button-state samples pass (worst 9.75:1 light, 17.29:1 dark), axe reports zero contrast violations, and both repos' gates pass. |
| 2026-07-11 | [glass-button-label-layout](2026-07-11-glass-button-label-layout.md) | Claude → Codex | done | Fixed in `../ui-library` and rebuilt: hero/contact buttons are 44px, project-card button is 36px, with single-line labels and 8px gaps in both themes. Both repos' tests/typechecks pass; Storybook builds; hero rest/hover contrast passes AA (worst 9.27:1). |
