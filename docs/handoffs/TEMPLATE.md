# Handoff: <one-line goal>

Audience: implementing agent (<Claude|Codex>). Scope: <files/areas, branch>.
Goal: <what "done" means, as a falsifiable statement>.

Every claim below was **measured on <date>** against <method — running app,
test run, script output>. Do not re-derive by eye; re-measure with the same
tools after changing anything (see Verification).

## Findings

<What you found, with evidence — file:line references, measured numbers,
screenshots referenced by path.>

## Root cause

<Why it's happening, not just what is happening.>

## Fix

<Concrete steps with file:line references and code snippets. If more than
one approach is viable, name the preferred one and say why.>

## Verification (required before marking `done`)

1. <command>
2. <expected result>
3. ...

## Out of scope

<Things you noticed but didn't fix, so nobody "improves" them by accident or
duplicates the audit.>

---

Register this handoff in `docs/handoffs/CHANGELOG.md` as `open` when you
create it.
