# e24s01 — GitHub Contribution Graph

**Epic:** e24 | **BCPs:** 5 | **Status:** todo

## 1. Summary

Add a GitHub-style contribution heatmap to the portfolio home page. Data is fetched from the GitHub GraphQL API at build time using a fine-grained PAT, rendered via `react-activity-calendar`, and styled to match the site's zinc/new-york theme.

## 2. Why

Portfolio visitors (potential employers, collaborators) get an at-a-glance credibility signal — real, verifiable development activity — without the site owner doing any manual upkeep. The graph self-updates on each deploy.

## 3. Users

- **Primary:** Portfolio visitors evaluating the developer's activity level
- **Secondary:** The site owner (Kenneth) — zero-maintenance display

## 4. User Story

> As a **portfolio visitor**, I want to see a visual representation of the developer's GitHub contribution activity so I can quickly assess their consistency and engagement without leaving the page.

## 5. Dependencies

- `react-activity-calendar` (npm, v3+) — adopt
- GitHub GraphQL API — compose
- `GITHUB_TOKEN` env var (fine-grained PAT with `read:user` scope)
- `@tanstack/react-start` server function or loader

## 6. Implementation Notes

- **Data fetch:** TanStack Start server function queries GitHub GraphQL for `user.contributionsCollection.contributionCalendar.weeks`. Response includes `contributionDays[{ date, contributionCount }]`. Mapped to `Activity[{ date, count, level }]` where level = quantized contributionCount (0 → 4).
- **Rendering:** `<ActivityCalendar>` from `react-activity-calendar`, passed the mapped data array. Theme configured with zinc-scale colors for light and dark modes.
- **Username:** Read from `SITE.github` (parse username from URL) or a new field on SITE. No hardcoded string.
- **Error boundary:** Server function returns a discriminated union `{ ok, data } | { error }`. Component renders fallback on error.
- **Empty state:** The calendar component renders zero-activity cells natively — no special handling needed when all counts are zero.

## 7. Files Changed

| File | Change |
|------|--------|
| `src/lib/github.ts` | **New.** Server function: fetch contributions from GitHub GraphQL, map to `Activity[]` |
| `src/components/contribution-graph.tsx` | **New.** Client component wrapping `<ActivityCalendar>` with theme and error handling |
| `src/content/site.ts` | **Edit.** Add `githubUsername` field |
| `src/routes/index.tsx` | **Edit.** Add `<ContributionGraph>` section to home page |
| `src/lib/github.test.ts` | **New.** Vitest tests for data mapping and error paths |
| `.env.example` | Already exists — `GITHUB_TOKEN` documented |

## 8. Design Tokens

Contribution level colors (zinc-scale, light mode):

| Level | Color | Tailwind |
|-------|-------|----------|
| 0 | `#f4f4f5` | `zinc-100` |
| 1 | `#d4d4d8` | `zinc-300` |
| 2 | `#a1a1aa` | `zinc-400` |
| 3 | `#71717a` | `zinc-500` |
| 4 | `#3f3f46` | `zinc-700` |

Dark mode: invert — lightest = highest activity.

## 9. Constraints

- Build-time fetch only — no runtime API calls
- Token never shipped to client bundle
- SSR-compatible (no `useEffect` data fetching in the calendar component)
- TypeScript strict — no `any`

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| GitHub API rate limit at build | Low | Low | PAT has 5,000 req/hr; build runs infrequently |
| Token leak | Low | Medium | Token is env-var only, gitignored, server-side |
| `react-activity-calendar` SSR issue | Low | Medium | Library claims SSR support; verify during impl |
| GraphQL schema change | Low | Medium | GitHub's GraphQL is versioned; field is stable |

## 11. Non-Functional Requirements

- **Performance:** Graph renders at <16px block size, no layout shift (dimensions known from data length)
- **Accessibility:** SVG with `<title>` and `<desc>`, keyboard-navigable (library provides this)
- **Responsive:** Calendar auto-scales; no horizontal scroll at 320px width

## 12. Rollback Plan

Remove the `<ContributionGraph>` line from `index.tsx`. No database, no migration.

## 13. Monitoring

- Vercel build logs for GraphQL fetch failures
- No runtime monitoring (static SSR output)

## 14. Documentation

- `.env.example` documents `GITHUB_TOKEN`
- Component JSDoc explains data flow

## 15. Open Questions

None — all decisions made in Prior Art and scope discussions.

## 16. Definition of Done

- [ ] `react-activity-calendar` installed
- [ ] Server function fetches and maps GitHub contributions
- [ ] `<ContributionGraph>` renders on home page
- [ ] Error state renders fallback text
- [ ] Empty data renders zero-color grid
- [ ] Theme matches site (light + dark)
- [ ] Username configured via `SITE.githubUsername`
- [ ] Vitest tests pass for: valid data, empty data, error
- [ ] TypeScript typechecks
- [ ] Site builds without errors

## 17. Acceptance Criteria (Gherkin)

```gherkin
Feature: GitHub Contribution Graph
  As a portfolio visitor
  I want to see the developer's GitHub contribution activity
  So I can assess their development consistency

  Scenario: Normal activity data
    Given the GitHub GraphQL API returns contribution data for the configured username
    When the home page renders
    Then a 52-week contribution grid is displayed
    And cells are colored by activity level (0–4)

  Scenario: No activity
    Given the GitHub GraphQL API returns all-zero contribution data
    When the home page renders
    Then the contribution grid is displayed in the zero-activity color
    And no error message is shown

  Scenario: API failure
    Given the GitHub GraphQL API is unreachable
    When the home page renders
    Then the section displays "Activity data unavailable right now"
    And no blank area or 500 error is shown

  Scenario: Accessibility
    Given a screen reader user navigates to the contribution graph
    When they focus the graph element
    Then the grid structure is announced with date and activity level information
```

## 18. Test Plan

| Test | Type | File |
|------|------|------|
| Data mapping: GitHub response → Activity[] | unit | `src/lib/github.test.ts` |
| Error response → error discriminated union | unit | `src/lib/github.test.ts` |
| Component renders with valid data | integration | future component test |
| Component renders fallback on error | integration | future component test |

## 19. Changelog Entry

```
### Added
- GitHub contribution graph on the home page (#e24s01)
```

## 20. References

- [SCOPE_LATEST.yaml](../../product/SCOPE_LATEST.yaml)
- [react-activity-calendar](https://github.com/grubersjoe/react-activity-calendar)
- [GitHub GraphQL — contributionsCollection](https://docs.github.com/en/graphql/reference/users)
