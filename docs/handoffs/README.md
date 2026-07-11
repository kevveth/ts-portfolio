# Agent handoffs

This directory is the async handoff changelog between coding agents working
this repo — currently Claude Code and Codex CLI. Ken stays in the loop by
reading the changelog, not by gating every status change.

## Why file-based

Both agents are terminal tools a human launches; they don't run concurrently
watching a queue. A git-tracked handoff doc is async and diffable, and it
keeps Ken visible into what agents did without requiring him to merge work
into `main` himself.

## When to write one

Write a handoff when you're stopping mid-task and want another agent (or your
next session) to pick it up: a scoped fix inside code you don't own (e.g. the
linked `ui-library` package), a task Ken explicitly wants routed to "the
other agent," or an audit whose findings should survive past this session.
Don't write one for work you're about to finish yourself in the same session.

## Format

Copy `TEMPLATE.md` to `docs/handoffs/YYYY-MM-DD-slug.md`. Keep the shape:
audience/scope/goal, measured findings (re-run tools, don't eyeball), root
cause, fix steps with `file:line` references, a verification checklist. See
`2026-07-10-home-color-contrast.md` for a worked example.

## Status lifecycle

Register every handoff in `CHANGELOG.md` the moment you create it, and
update the row as work progresses.

- `open` — written, nobody has started
- `in-progress` — an agent is actively working the fix
- `done` — the handoff's verification checklist genuinely passed; agents may
  set this themselves, no sign-off required
- `needs-review` — work is finished but you're not fully confident, or it
  hinges on a judgment call only Ken can make — use this instead of `done`
  when in doubt
- `blocked` — stuck, needs Ken's input to proceed

Default to running the verification checklist and marking `done` yourself.
Reach for `needs-review` only when the checklist can't fully confirm it or
the call is genuinely Ken's to make.

## Changelog

See `CHANGELOG.md`.
