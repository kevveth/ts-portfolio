# Developer Portfolio — Product Contract

Status: active
Owner: Kenneth Rathbun

This document defines the product outcomes and durable constraints for the
portfolio. It is not an implementation plan. Existing code, tests, and current
framework behavior decide how those outcomes are achieved.

## Purpose and audience

The portfolio turns shipped work into credible evidence of Kenneth's
engineering ability. Its primary audience is recruiters and engineering teams,
with freelance clients as a secondary audience.

The site should feel technically rigorous without reading like internal
documentation. Claims must be understandable, specific, and supported by real
work.

## Product goals

- Make a strong first impression when the site or a project page is opened or
  shared.
- Present Chavo's Parlor as a deep, honest case study of a production system.
- Show ongoing engineering activity and relevant credentials without inflating
  what they prove.
- Stay fast, accessible, resilient, and easy to extend with future work.
- Preserve a distinctive, restrained technical aesthetic in light and dark
  themes.

## Current experience

- `/` introduces Kenneth, features the primary case study, shows GitHub
  activity and selected credentials, and provides direct contact paths.
- `/projects` lists published case studies.
- `/projects/$projectId` presents a project narrative, technical decisions,
  outcomes, and supporting media. Unknown ids resolve to a real 404.
- `/credentials` presents the complete credential collection and its evidence.
- The document shell owns navigation, theme control, global metadata, and the
  footer.

The route set can evolve when a new product need justifies it. Earlier v1
non-goals are not permanent prohibitions.

## Content principles

- Evidence over adjectives. Prefer concrete constraints, decisions, and
  outcomes to unsupported claims of quality or expertise.
- Repository-owned content is typed TypeScript in `src/content/`. Runtime
  validation belongs at untrusted boundaries, not around static literals by
  default.
- Chavo's Parlor claims must be checked against the real project or live site.
  Do not invent performance, analytics, review, or business metrics.
- Credentials keep issuer-supplied titles and evidence. Portfolio copy must not
  imply a proficiency level the issuer did not award.
- Contact remains direct and low-friction. A form, résumé, blog, or additional
  project is allowed when deliberately scoped; none is required by this
  contract.

## Durable technical constraints

- TanStack Start and Router provide the React application and file-based route
  boundaries. Version-sensitive decisions must be verified against the
  installed packages and current primary documentation.
- Static content should stay directly importable. Add loaders or server
  functions for genuine asynchronous, trust-boundary, or routing needs rather
  than ceremony.
- Source project imagery lives under `src/assets/<project-id>/` and is processed
  at build time. Static passthrough assets live in `public/`.
- Responsive images carry intrinsic dimensions. Above-the-fold media may load
  eagerly; below-the-fold media should not compete with first paint.
- Theme behavior follows the OS until the visitor chooses an override. A saved
  choice must remain visually and metadata-consistent without a flash on load.
- Per-route titles, descriptions, canonical URLs, and social metadata must
  describe the page being shared. Social images should be intentionally sized
  for that use rather than reusing an arbitrary display fallback.
- The site deploys to Vercel and is prerendered where its data permits.
- Package management is pnpm-only.

## Accessibility and quality bar

- Keyboard navigation, focus order, heading structure, landmarks, alternative
  text, and reduced-motion behavior are product requirements.
- UI and layout claims must be checked in a real rendered browser. Contrast on
  translucent, gradient, blurred, or image-backed surfaces must be measured
  from rendered pixels.
- Graceful degraded states are preferable to blank sections or page-level
  failures when optional external data is unavailable.
- Relevant focused tests should protect content contracts, helpers, routing,
  and rendered behavior.
- Before landing a change, run `pnpm test`, `pnpm typecheck`, and `pnpm check`;
  run `pnpm build` for changes that can affect production output or routing.

## Change policy

- This file describes what the product must accomplish, not the exact markup,
  helper names, schemas, or component boundaries it must use.
- A plan is actionable only when it is marked active and reflects a current
  owner decision. Completed, superseded, archived, research, and handoff
  documents are evidence and context, not standing instructions.
- When a historical document conflicts with the current code, tests, this
  contract, or a direct owner request, do not follow the historical document.
- Record durable architectural decisions as ADRs. Keep temporary implementation
  plans narrow and remove or archive them when the work is finished.
