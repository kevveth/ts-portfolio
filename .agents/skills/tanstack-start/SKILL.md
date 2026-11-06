---
name: tanstack-start
description: Resolve TanStack Start or Router API uncertainty and verify routing/server changes or upgrades against installed versions and relevant official documentation.
---

# TanStack Start and Router guidance

Use this for framework behavior, API uncertainty, and upgrades. Routine copy,
content-data, or CSS changes do not need framework research.

- Establish the installed version from the lockfile or package metadata. Inspect
  installed types/source for the API in question; package.json ranges alone may
  not identify the installed behavior.
- When current guidance is needed, retrieve only the relevant official TanStack
  documentation or source. Context7 can help locate it; follow its primary links.
- For changes to this repository, installed contracts and observed behavior
  determine what can ship. Identify recommendations that require an upgrade.
- For upgrade research, compare the proposed version with the installed baseline.
  Report checked versions and sources when conclusions depend on them.

Start with https://tanstack.com/start/latest/docs/framework/react and the
https://github.com/TanStack/router source for the relevant package.
