# Documentation authority

Repository documents serve different purposes. Their location alone does not
make them instructions.

## Current guidance

1. Kenneth's current request and decisions.
2. `SPEC.md` for product outcomes and durable constraints.
3. `CONTEXT.md` for domain language.
4. Accepted ADRs for durable architecture decisions.
5. Current code, tests, and installed dependency behavior for implementation
   facts.

`AGENTS.md` defines how Codex works in this repository. It does not turn every
document under `docs/` or `specs/` into a requirement.

## Document statuses

- **Active** plans must say `Status: active` and identify the current owner
  decision they implement.
- **Completed** or **superseded** plans are historical records only.
- **Research** informs a decision but does not make one.
- **Archive** content may be stale and is never current guidance.
- **Handoffs** preserve measured state between Codex sessions; they do not
  broaden the task they describe.

When an old document conflicts with current instructions, `SPEC.md`, code,
tests, or primary framework behavior, treat the old document as historical.
Update or remove it instead of working around it.
