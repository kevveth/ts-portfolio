# Credentials experience refactor plan

Status: completed; retained as a historical implementation record.

## Outcome

Refactor the portfolio's credentials feature around a single domain concept,
`Credential`, and redesign its two presentation surfaces for different visitor
jobs:

- The homepage presents a compact, unnumbered editorial list of Featured
  Credentials for fast scanning.
- `/credentials` presents the complete Credential Collection as an
  evidence-forward gallery.

The primary audience is a hiring manager or recruiter looking for credible,
role-relevant achievements. Certificate imagery is evidence for a Credential,
not a separate content category.

## Accepted experience direction

### Homepage

Use the accepted editorial-list direction (concept A):

- Heading: **Credentials**.
- Open rows separated by dividers; do not use a card grid.
- No row numbers, topic badges, category badges, or inferred course versus
  certification labels.
- Show title, issuer, earned date, Credential Description, and exactly one
  preferred evidence action.
- Prefer an official verification link when one exists; otherwise open the
  certificate preview in an accessible lightbox.
- End with **View all credentials**, linking to `/credentials`.
- Render rows in the explicit relevance order of the featured selection, not
  chronological order.

### Complete collection page

Adapt the evidence-forward gallery direction (concept B):

- Route and navigation label: **Credentials**.
- Show every Credential newest-earned first.
- Make certificate previews visually prominent without turning them into
  decorative imagery.
- Preserve issuer, earned date, Credential Description, expiration metadata,
  and available external verification.
- Open certificate previews in the shared accessible lightbox.
- Keep expired Credentials as historical achievements and label their
  expiration clearly.
- Do not add filters, pagination, or individual Credential routes for the
  current collection size.

### Responsive behavior

- Homepage rows collapse to a single text column with the evidence action
  following the metadata and description.
- Gallery entries stack vertically on narrow screens; certificate previews
  retain their intrinsic aspect ratio and never crop evidence.
- All interactive targets retain visible focus and at least the project's
  existing touch-target sizing.

## Domain and content module

Deepen `src/content/credentials.ts` so callers do not reproduce ordering,
eligibility, or evidence-selection rules.

### Content shape

Replace the current display-driven fields:

- Remove `kind`.
- Remove `topics`.
- Rename `summary` to `description` and keep it as original portfolio copy
  describing the Credential's subject matter.
- Replace required `previewKey` with optional certificate evidence.
- Retain optional `verificationUrl` and `expiresOn`.
- Require at least one evidence path through content validation: a certificate
  preview, verification URL, or both.

Keep the content module dependency-free and store image registry keys rather
than optimized image imports.

### Selection and ordering

- Add one explicit ordered `FEATURED_CREDENTIAL_IDS` list beside the canonical
  collection. Do not add a `featured` boolean to every Credential.
- `getAllCredentials()` returns the complete collection newest-earned first.
- `getFeaturedCredentials(asOf)` resolves the ordered IDs, rejects missing or
  duplicate IDs, and excludes expired Credentials.
- Accept `asOf` explicitly at the interface so expiration behavior is
  deterministic in tests. The home route supplies the current date through its
  loader rather than letting presentational modules call the clock.
- Add a small pure selector for the homepage's preferred evidence: external
  verification first, certificate fallback.

The content module is the test seam. Tests should assert observable ordering,
eligibility, and evidence results through its exported interface rather than
reaching into the underlying arrays.

## Presentation modules

Refactor `src/components/credentials.tsx` into a feature module with a small
external interface and internal presentation details:

- `FeaturedCredentials` receives the selected Credentials and renders the
  homepage editorial list.
- `CredentialCollection` receives all Credentials and renders the gallery used
  by `/credentials`.
- A shared certificate lightbox owns dialog labeling, responsive image sizing,
  Escape behavior, and focus restoration.
- Date formatting and evidence labels remain private to the feature module.

Avoid extracting pass-through row or metadata modules unless doing so hides
real behavior or enables a second caller. The goal is locality, not a larger
component tree.

## Routes and navigation

1. Update the home loader to obtain Featured Credentials for an explicit
   current date and pass them to `FeaturedCredentials`.
2. Add `src/routes/credentials.tsx` with page metadata, canonical URL, a
   `PageIntro`, and `CredentialCollection`.
3. Add the Credentials route to the header's typed `NAV_ITEMS`; the existing
   desktop and mobile navigation should consume the same local list.
4. Run `pnpm generate-routes`; never edit `src/routeTree.gen.ts` manually.

## Implementation slices

### 1. Establish the content interface

- Write failing content tests for evidence presence, ordered featured
  selection, newest-first collection order, and expiration eligibility.
- Refactor the Credential shape and migrate the two Anthropic records.
- Implement the collection, featured, and preferred-evidence selectors.
- Remove replaced tests that assert `kind`, `topics`, or internal array order.

Completion signal: content tests describe the new domain rules and pass without
importing UI or image modules.

### 2. Preserve and share certificate evidence behavior

- Write the lightbox behavior test first: accessible name and description,
  certificate image alternative text, Escape close, and focus restoration.
- Move the existing dialog implementation behind the shared feature interface.
- Keep optimized responsive sources through `credential-images.ts`.

Completion signal: both presentation surfaces can invoke the same tested
certificate behavior without duplicating dialog markup.

### 3. Build the homepage editorial list

- Replace the current two-card grid with concept A's open, divided rows.
- Render the single preferred evidence action for each row.
- Add the `/credentials` section action.
- Remove category and topic presentation entirely.

Completion signal: the homepage preserves explicit featured order and exposes
one evidence action per Credential at desktop and mobile widths.

### 4. Add the evidence-forward collection page

- Add the `/credentials` route and collection gallery based on concept B.
- Render all Credentials newest-first, including expiration and verification
  when present.
- Add the persistent header navigation entry.
- Regenerate the route tree.

Completion signal: direct navigation and client navigation both render the
complete collection, and the active navigation state is correct on desktop and
mobile.

### 5. Visual and accessibility verification

- Inspect the real homepage section and `/credentials` page at desktop and
  mobile widths in both light and dark themes.
- Verify long titles, descriptions, absent certificate evidence, official
  verification, both evidence fields, and an expired Credential with focused
  fixtures.
- Confirm previews use `object-contain`, retain document edges, and request
  appropriately sized image sources.
- Check keyboard focus, dialog close/restore behavior, semantic heading order,
  external-link labeling, and absence of console errors.
- If implementation introduces translucent, gradient, or backdrop-filtered
  surfaces, run pixel-based WCAG contrast verification before shipping.

Completion signal: rendered measurements and screenshots support the layout
claims; accessibility behavior is covered by focused tests and browser checks.

### 6. Clean up and run repository gates

- Delete any temporary variant switcher, prototype-only query handling, and
  losing prototype markup before finalizing production code.
- Run `pnpm test`, `pnpm typecheck`, `pnpm check`, and `pnpm build`.
- Review the generated route-tree diff and all credential image registry
  changes.

## Test matrix

### Content

- IDs are unique kebab-case strings.
- Earned and expiration dates are valid date-only values.
- Every Credential has at least one evidence path.
- Featured IDs are unique and resolve to real Credentials.
- Featured output preserves the explicit relevance order.
- Expired Credentials remain in the collection but are absent from featured
  output for a supplied `asOf` date.
- Complete collection output is newest-earned first.
- Preferred evidence chooses verification before certificate and falls back to
  certificate when verification is absent.

### Presentation

- Homepage and page headings use **Credentials**.
- Homepage has no category badge, topic list, or ordinal labels.
- Homepage renders one preferred evidence action per Credential.
- Certificate fallback opens the accessible lightbox.
- Verification preference renders an external link without opening the
  certificate dialog.
- Collection page renders expiration and all available evidence.
- Dialog closes on Escape and restores focus to its trigger.

### Rendered browser checks

- Homepage editorial rows: desktop/mobile, light/dark.
- Collection gallery: desktop/mobile, light/dark.
- Certificate lightbox: landscape and narrower viewports.
- Header navigation: active states and mobile sheet close behavior.
- No horizontal overflow, clipped certificate content, layout shift from lazy
  images, or console errors.

## Non-goals

- Individual Credential detail routes.
- Search, filters, pagination, or credential categories.
- Inferring whether an issuer's achievement is a course or professional
  certification.
- Ranking credentials with visible numbers.
- Proficiency claims derived from completing a Credential.
- A CMS, remote data source, or automated issuer integration.

## Documentation record

The accepted domain language is maintained in `CONTEXT.md`. No ADR is proposed:
the selected UI composition and local content-module shape are reversible, are
not surprising architectural commitments, and do not meet the repository's
threshold for an ADR.
