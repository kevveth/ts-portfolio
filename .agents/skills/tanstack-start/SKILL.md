---
name: tanstack-start
description: Establish current TanStack Start and TanStack Router behavior before implementing, reviewing, or answering version-sensitive framework questions.
---

# Current TanStack Start knowledge

Establish two baselines before relying on a framework API:

1. **Installed baseline.** Read the exact `@tanstack/react-start`,
   `@tanstack/react-router`, and related package versions from the lockfile or
   installed package metadata. Inspect installed types or source when behavior
   is version-sensitive. This baseline is complete when the versions and the
   executable contract relevant to the task are known.
2. **Upstream baseline.** Retrieve only the task-relevant current documentation
   through Context7 when available, then follow its citations to primary
   TanStack sources. For latest behavior, migrations, or ambiguity, consult the
   official Start docs and the `TanStack/router` repository directly. This
   baseline is complete when the current primary guidance relevant to the task
   is identified.

Resolve differences according to the task:

- When changing this repository, the installed package's types, source, and
  observed behavior define what can ship. Use current upstream guidance to
  interpret the API and identify upgrade-only alternatives.
- When researching an upgrade or the latest recommended approach, use current
  primary TanStack sources and state any mismatch with the installed version.
- Treat Context7 as a retrieval index, not an authority. Prefer
  `https://tanstack.com/start/latest/docs/framework/react` and documentation or
  source under `https://github.com/TanStack/router` for conclusions.

When a conclusion depends on version or recency, report the checked package
version and source. Date durable research notes so later agents can tell when
they need refreshing.
