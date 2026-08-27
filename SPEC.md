# Developer Portfolio — Product Direction

Status: active
Owner: Kenneth Rathbun

This document records the enduring product intent and outcomes Kenneth wants
for the portfolio. It deliberately leaves implementation choices open. Current
code and tests describe present behavior and protect deliberate decisions, but
they do not veto an explicit durable owner change.

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

## Core visitor journeys

- A visitor can quickly understand who Kenneth is, the work he does, and how
  to contact him.
- A visitor can discover published projects and open a case study that explains
  its context, technical decisions, outcomes, and supporting evidence.
- Chavo's Parlor remains the primary case study until a deliberate product
  change replaces or repositions it.
- A visitor can see recent engineering activity and selected credentials, then
  inspect the complete credential collection and its evidence.
- An unknown project URL resolves to a real, useful 404.

The routes and composition supporting these journeys may evolve as product
needs change.

## Content principles

- Evidence over adjectives. Prefer concrete constraints, decisions, and
  outcomes to unsupported claims of quality or expertise.
- Chavo's Parlor claims must be checked against the real project or live site.
  Do not invent performance, analytics, review, or business metrics.
- Credentials keep issuer-supplied titles and evidence. Portfolio copy must not
  imply a proficiency level the issuer did not award.
- Contact remains direct and low-friction. A form, résumé, blog, or additional
  project is allowed when deliberately scoped; none is inherently required.

## Experience outcomes

- Theme behavior follows the OS until the visitor chooses an override. A saved
  choice must remain visually and metadata-consistent without a flash on load.
- Per-route titles, descriptions, canonical URLs, and social metadata must
  accurately describe the page being viewed or shared. Sharing imagery should
  be intentional and appropriate to the destination.
- Visitors can navigate by keyboard, perceive focus, follow a meaningful
  heading and landmark structure, understand non-decorative media, and use the
  site with reduced motion.
- Text and controls remain legible across the actual surfaces and states in
  which they appear.
- Layouts and media remain usable across supported viewport sizes without
  obscuring evidence or primary actions.
- When optional external content is unavailable, show a truthful degraded
  state rather than a blank section or page-level failure.
- Media loading avoids shifting primary content or needlessly delaying first
  paint.
- The experience stays responsive and avoids needless delay or instability in
  the visitor's primary journeys.
