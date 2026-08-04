# Issue tracker: GitHub

Issues and agent-generated specs or tickets for this repo live as GitHub issues in `kevveth/ts-portfolio`. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`.
- **Apply or remove labels**: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- **Close**: `gh issue close <number> --comment "..."`.

Infer the repo from `git remote -v`; `gh` does this automatically when run inside the clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** Set this to `yes` if this repo starts treating external PRs as feature requests; the `triage` skill reads this flag.

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`, then keep only `authorAssociation` values of `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE`.
- **Comment, label, or close**: use `gh pr comment`, `gh pr edit --add-label` or `--remove-label`, and `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either. Resolve it with `gh pr view 42` and fall back to `gh issue view 42`.

## Publishing and fetching work

When a skill says "publish to the issue tracker," create a GitHub issue. When a skill says "fetch the relevant ticket," run `gh issue view <number> --comments`.

## Wayfinding operations

The `wayfinder` skill uses a single map issue with child issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes, Decisions-so-far, and Fog sections. Create it with `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue using `gh api`. Where sub-issues are unavailable, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Use `wayfinder:<type>` labels where `<type>` is `research`, `prototype`, `grilling`, or `task`. Once claimed, assign the ticket to the driving developer.
- **Blocking**: use GitHub's native issue dependencies. Add an edge with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric database ID from `gh api repos/<owner>/<repo>/issues/<n> --jq .id`. Where dependencies are unavailable, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body.
- **Frontier query**: list the map's open children, discard any with an open blocker or assignee, and select the first remaining ticket in map order.
- **Claim**: `gh issue edit <n> --add-assignee @me`; this is the session's first write.
- **Resolve**: comment with the answer, close the child ticket, then append a context pointer and link to the map's Decisions-so-far section.
