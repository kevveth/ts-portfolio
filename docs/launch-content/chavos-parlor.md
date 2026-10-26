# Chavo’s Parlor — case study for editorial review

Draft for Ken’s review. The simplified architecture and regular-hours sync are live;
the barber repository’s October 23 release record records actual Production acceptance
and limits. On October 26, 2026, Ken confirmed that Chavo has already approved
the photos and reviews discussed for the site and portfolio. This draft remains
subject to Ken's editorial review.

## Suggested portfolio copy

### A distinctive website around an existing booking workflow

Chavo’s Parlor is a neighborhood barber shop in San Diego. I built a branded,
mobile-first marketing website for my longtime barber, without payment. It helps customers understand the shop, browse its services, and reach its existing Square booking experience.

The visual direction uses bold typography, a dark background, a rust accent, and
approved photography of the barber’s work. The page brings services, reviews,
hours, location, and arrival instructions into one place. On smaller screens, a
persistent booking control keeps the main action reachable while customers browse.

### Keep the barber’s workflow familiar

Square owns scheduling, customer records, and payments. The website reads the
service catalog and regular location hours instead of asking the barber to maintain
a second price list or weekly schedule. Staff availability and holiday exceptions
remain outside this sync.
Booking opens Square’s official widget, with a hosted-page fallback if the embed
cannot load. Native booking links also work without JavaScript.

I explored a custom booking/payment flow earlier in the project, then simplified
the maintained application around the service the barber already uses. That
reduced the website’s operational responsibilities and the amount of custom code
needed to support appointments.

### Treat reliability as part of the delivery

The implementation validates Square’s catalog and stores a private snapshot of a
complete public menu. It can label an older menu during a temporary outage and
stop displaying it after a defined age. It never substitutes invented services or
prices. Development and Preview use Square sandbox configuration and a local
booking stub so testing stays separate from the live shop.

Accessibility checks cover mobile reflow, keyboard focus, booking controls,
contrast, and page structure. Automated browser tests exercise the compiled
application, including native links, redirects, metadata, and the website’s
booking-modal fallback. A separate deployed check exercised Square’s real form,
including keyboard entry, accessible labels, Close/focus restoration, and the
hosted fallback. It did not submit an appointment or payment.

### Delivery status

The simplified integration launched October 21, 2026 at
[chavosparlor.com](https://chavosparlor.com/). The latest accepted application,
`b91afe2`, added regular location-hours sync on October 23.
On October 26, the canonical domain still resolved to that accepted deployment.
Follow-up stale-hours and service-grouping fixes are merged at `8e2fbd7`; their
staged candidate passed focused health, browser and recovery checks on October 26, but public promotion and canonical acceptance remain pending.
The custom booking/payment experiment is retired in Git history at `b96f939`,
not maintained behind a feature flag.

The real catalog, private snapshot, isolated recovery rehearsal, widget/fallback,
and Production health checks passed. The project demonstrates a
branded local-business website integrated with an established booking provider;
it does not yet establish an increase in bookings, revenue, or conversion rate.

## Screenshot and evidence notes for the revamp

Use `src/assets/chavos-parlor/production-desktop.png` for the cover and `production-mobile.png` for a phone view. Both are real accepted Production captures from October 21, 2026, before regular-hours sync. Keep that date visible in captions; the cover may show a crop, and a full screenshot should remain inspectable. The asset README records exact source, revision and consent limits.

Canonical supporting records live in `/Users/kennethrathbun/Documents/projects/barber-shop/docs/`: `release-2026-10-21.md`, `release-2026-10-23.md`, `client-handoff.md`, `production-rollout.md`, and `release-plan-2026-10-26.md`. Those records separate tests with documented stand-ins from actual deployed acceptance. The October 26 candidate record adds focused staged evidence; no public release acceptance is asserted here.

## How this supports a freelance offering

Use this as evidence for a service that combines a branded local-business website,
integration with the client’s existing booking provider, responsive/accessibility
checks, and an operational handoff. Prices, support terms, turnaround, revisions,
and other providers need their own scoped offer. This repository is a client
implementation, not a generic template ready to distribute with its content and
credentials.
