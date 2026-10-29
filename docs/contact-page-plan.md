# Dedicated contact page

Status: completed — approved code-ready milestone; operational milestone deferred.
Owner: Kenneth Rathbun
Prepared: October 28, 2026
Repository: `/Users/kennethrathbun/Documents/projects/ts-portfolio`

## Code-ready completion — October 28, 2026

Kenneth approved implementation in this chat; the plan was marked active before
work began. The code-ready milestone is complete on `codex/contact-page`, based
on `origin/main` at `abdc2f4`. Changes remain local and uncommitted. The separate
operational milestone below is not authorized by completion of this milestone.

- Added the contact page, strict shared schema, bounded POST handler and
  server-only Resend adapter. Navigation uses `/contact`; legacy footer anchors
  remain. Delivery defaults to disabled; the public email address is unchanged.
- Added `.env.example` entries and `docs/contact-setup.md`; no credentials,
  accounts, DNS, firewall changes, purchases, messages, pushes or deployments.
- Final `CONTACT_FORM_ENABLED=false pnpm build` passed: type checking,
  74 tests across 11 files, Biome, client/server builds and six-page prerender.
- Checked contact canonical metadata, prerendered HTML and sitemap inclusion;
  API endpoint excluded. Private sending configuration/provider URL absent
  from generated client JavaScript.
- In-app browser: direct load/refresh and About -> contact navigation; light
  and dark layouts at desktop and 390px phone CSS viewport (also checked at
  325px); no horizontal overflow, stacked mobile fields and 16px mobile inputs.
  Verified labelled validation/focus, email -> message keyboard order, disabled
  503 feedback, text preservation and restored submit focus. Fresh final load
  had no console errors/warnings or framework overlay. A transient development
  HMR warning while changing effect dependencies cleared on fresh load.
- Accepted/pending, provider failure/timeout, safe retry IDs and rejection paths
  were verified with mocked transport in automated tests. The available browser
  interface has no request-interception API; no public mock endpoint was added.
- Screenshots are outside the repository in `/tmp/contact-page-review/`.
- No real inbox delivery, cross-browser audit or assistive-technology audit was
  performed. Domain/mailbox selection, verified sender, live secrets, retention
  review, scoped WAF enforcement, authorized delivery check and publication
  remain for a separately authorized operational milestone.

## Approved follow-up — TanStack Form migration, October 28, 2026

Kenneth requested migrating the frontend to TanStack Form and removing visible
`(required)` label suffixes. The migration is complete locally with
`@tanstack/react-form` 1.33.5. The existing server endpoint and Resend adapter
remain unchanged. This supersedes the original plain-React frontend choice.

- `useForm`, field components and the form store now own values, validation
  errors, submission state and message reset. Shared Zod rules are used through
  Standard Schema, with explicit parsing before sending to apply transformations.
- Email/message labels have no required suffix. Semantic required attributes
  remain; errors appear underneath after a submit attempt. Untouched blur does
  not show validation errors. Server field errors can be corrected and retried.
- Custom outcome feedback and provider idempotency remain application concerns;
  they are not duplicated as parallel field/submission state.
- Existing `latest` dependencies retained their prior locked versions; only
  TanStack Form and its required dependency entries were added.
- Final build passed: 75 tests across 11 files, types, Biome, production builds
  and six-page prerender. In-app browser checked desktop/light and phone/dark
  error presentation, focus, corrected submission to the disabled endpoint,
  retained message text and no horizontal overflow. Console was clean.
- No real email, external configuration, push or deployment. Screenshots:
  `/tmp/contact-page-review/tanstack-validation.jpg` and
  `/tmp/contact-page-review/tanstack-mobile-errors.jpg`.

Kenneth's later visual refinement follows the Supreme reference more closely:
short `name`, `email`, and `message` placeholders inside the fields, associated
screen-reader labels, no optional/required label suffixes, and a thin neutral
focus indicator instead of the emerald field outline. Form controls have no
hover animation or color treatment. Submit-time errors remain underneath.
The production build and all 75 tests passed after this refinement.

## Responsive refinement — October 29, 2026

Kenneth requested matching the reference's compact field sizing on small screens.
Measured Supreme at 1280, 768, 390 and 320px: its field text remained 11px and
its inputs/message remained 40/130px high. Removed our mobile override that
changed text from 12px to 16px and stacked the first row. The portfolio keeps
its approved 12px text, 44px inputs and 160px message box at all four widths,
with paired name/email and full-width subject/message. No horizontal overflow;
submit-time errors/focus checked at phone width. Build and all 80 tests passed.
Physical iPhone/Safari focus zoom was not tested; page zoom remains unrestricted.
Screenshot: `/tmp/contact-page-review/compact-mobile.jpg`.

## Outcome and scope

Build a public `/contact` page with TanStack Form and a custom server handler. Resend
delivers the inquiry to Kenneth's inbox; Kenneth replies using his normal email
client. Professional mailbox selection is independent of this integration.

The purpose is a useful, polished feature and a manageable engineering exercise.
Preserve the approved portfolio presentation. Keep validation, request handling,
and delivery separate so later features can be added without premature frameworks.

Kenneth does not yet own a domain and has not selected a professional mailbox.
Do not invent either, change the published email address, register accounts,
purchase services, configure DNS, or send messages as part of the initial build.
The existing public address is `dev.kenrathbun@gmail.com`.

There are two distinct completion milestones:

1. **Code ready:** complete implementation, meaningful mocked-delivery tests,
   required build, brief browser verification, and configuration instructions.
   This can be completed without accounts, credentials, or a domain.
2. **Operational:** owner-selected domain/mailbox, verified sender, secrets,
   production abuse controls, an authorized real delivery check, and authorized
   publication. Do not report this milestone complete from mocked tests alone.

The later goal should explicitly name which milestone it is pursuing. Approval
to implement this plan can activate this document; do not start from its presence
alone. Scope additions and decisions about external setup stay with Kenneth.

## Current baseline

- Local branch: `codex/footer-link-columns`, HEAD `9b24ea5`.
- Last inspected `origin/main`: merge `abdc2f4`, with identical application files.
- `SAVE.md` is intentionally uncommitted; preserve unrelated work.
- Installed TanStack Start: `1.168.60`; React Router: `1.170.41`.
- Existing stack: React 19, Zod 4, Tailwind 4, Vitest, Biome, pnpm.
- Refresh Git state before implementation and start a suitable feature branch
  from current main; do not implement on the previously merged feature branch.
- Read repository AGENTS.md and applicable local TanStack/browser skills.
  Recheck installed API contracts if package versions or source have changed.

## Page and form

- Reference: https://supreme.com/contact, inspected during planning. Adapt its
  restrained form presentation to this portfolio's approved identity.
- Preserve the emerald name block, muted SD clock, shared 620px frame, light/dark
  themes, compact navigation, and existing footer link columns.
- Use a small `Contact` heading and brief invitation, such as
  "For opportunities, projects, or a quick hello."
- Name and email remain paired across desktop and phone widths. Subject,
  message and the submit/status area occupy the full form width.
- Use accessible labels with in-field placeholders, thin solid borders, theme tokens, and restrained
  monospace utility typography. Input text should remain comfortable to read;
  retain the approved 12px input text across viewport widths.
- Use a small emerald `send` treatment with an adequate interaction target.
  Add personality through the inline state change, not a new visual language.
  No artificial sending delay; honor reduced motion for any transition.

| Field | Requirement | Validation after trimming |
| --- | --- | --- |
| Name | Optional | At most 100 characters; one line |
| Email | Required | Valid email, at most 254 characters; no CR/LF |
| Subject | Optional | At most 200 characters; one line; label `subject (optional)` |
| Message | Required | Nonempty, at most 5,000 characters; allow normal line breaks |

Use proper autocomplete and email input semantics. Do not require a business
email, account, phone, company, budget, subject, inquiry category, or attachment.
Provide a direct email link beneath the form, including a usable no-JavaScript
fallback. Leave GitHub/LinkedIn in their existing footer positions.

## User feedback

- Idle: form ready to fill in.
- Invalid: associate clear field errors with inputs; focus the first invalid
  field. Treat server validation as authoritative.
- Sending: announce pending status, prevent duplicate submit actions, and keep
  the submitted payload stable until the request settles.
- Accepted: only after the provider returns success and an email identifier,
  show "Thanks—your message has been submitted." Do not claim inbox delivery
  or promise a response deadline. Clear the message only after acceptance.
- Failed: preserve entered values, explain the next action, and offer direct
  email. A timeout may mean acceptance is uncertain; allow a safe manual retry.
- Limited: handle HTTP 429 and any Retry-After information with a calm retry
  message. Handle non-JSON infrastructure responses safely too.
- Unconfigured/disabled: return an honest unavailable response and direct-email
  fallback. No production mock-success mode.

Use accessible status announcements, visible focus, keyboard operation, and
adequate targets. Avoid unsolicited automatic retries that could send messages
after the visitor thinks the request has stopped.

## Routing and architecture

Prefer these small modules; adjust names only if implementation evidence shows
a clearer fit with repository conventions:

| Location | Responsibility |
| --- | --- |
| `src/routes/contact/route.tsx` | Page, route metadata, form composition |
| `src/routes/contact/-contact-form.tsx` | Form state and request/feedback UI |
| `src/routes/api/contact/route.ts` | POST-only HTTP endpoint |
| `src/lib/contact.ts` | Shared Zod schema, limits, public response types |
| `src/lib/contact.server.ts` | Bounded request handling and response mapping |
| `src/lib/contact-email.server.ts` | Server-only Resend configuration and delivery |

Use TanStack Form for controlled values, field errors, submission state and field
resets, with the shared Zod rules and native controls. Use native fetch for the
small REST call; no separate state library or email SDK is needed.
Mark private modules with the repository's server-only import protection.

Request flow: browser form -> same-origin `/api/contact` POST -> validation and
abuse checks -> Resend -> fixed recipient mailbox. Return a small structured
result; do not expose provider errors or private configuration to the visitor.

Use JSON for the enhanced form. Reject unsupported content types, malformed
payloads, and unsupported methods. Bound the actual request body to 32 KiB,
including when Content-Length is missing or inaccurate, before parsing it.
Accept only known fields plus the documented honeypot and submission identifier.
Require a matching, explicitly trusted Origin for browser submissions; do not
enable wildcard cross-origin access or trust arbitrary forwarded host headers.
Origin checks reduce cross-site misuse; they do not authenticate humans.
Return `Cache-Control: no-store` for endpoint responses.

Create a random submission identifier per logical payload. Reuse it for manual
retries of the same payload and renew it when the content changes or a new
message begins. Validate its shape and pass a namespaced idempotency key to
Resend. Keep the email body deterministic across retries. Provider idempotency
reduces duplicate acceptance within its documented retention window; it is not
a database, a rate limiter, or an exactly-once delivery guarantee.

Set a bounded provider request timeout (initially 10 seconds) and handle network
failure, rejection, quota exhaustion, and malformed provider responses.

Change shared contact navigation from `/#contact` to `/contact`. Preserve the
footer `id="contact"` so legacy fragment links still reach contact channels.
Keep work as `/#work`; update tests that currently group work/contact together.
Follow existing About-route metadata patterns and add canonical/social metadata.
Verify `/contact` in prerender output and sitemap; exclude the API endpoint.
Do not call Resend during render, route generation, prerender, or build.
Run `pnpm generate-routes`; never edit `routeTree.gen.ts` manually.

## Delivery configuration

Use server-only environment variables, documented as empty examples:

- `CONTACT_FORM_ENABLED`: defaults to false; must explicitly enable sending.
- `RESEND_API_KEY`: a sending key scoped as narrowly as the provider supports.
- `CONTACT_FROM_EMAIL`: verified sender selected after domain setup.
- `CONTACT_TO_EMAIL`: fixed destination chosen by Kenneth.
- `CONTACT_ALLOWED_ORIGINS`: exact allowed browser origins for the environment.

Validate configuration before sending. Read secrets in server request execution,
not eagerly at module import or build. Missing values must not prevent the rest
of the portfolio from building or loading. Keep preview/development sending
disabled unless a specific live check has been authorized and configured.
Use request-boundary mocks in tests; no public route/query switch that fakes
successful delivery.

Keep `SITE.email` as the public correspondence address until Kenneth selects
its replacement. Never prefix API keys with `VITE_` or put secrets in source,
client payloads, browser storage, logs, screenshots, or documentation.
Check the actual Vite/Nitro environment loading behavior; do not assume Next.js
env-file conventions apply. Do not overwrite existing credential-bearing files.

Send one plain-text notification per inquiry:

- From: configured verified address, with a portfolio label.
- To: configured fixed recipient; never taken from browser input.
- Reply-To: validated visitor email.
- Subject: fixed portfolio inquiry subject; no arbitrary user-controlled headers.
- Body: optional name, reply address, message, and stable submission identifier.

No automatic reply to the visitor, tracking pixels, or open/click tracking.
The provider request body and email must preserve the actual message as text.

## Basic abuse controls

Implement a hidden honeypot excluded from normal keyboard and assistive-tech
interaction, server validation, bounded bodies, fixed recipient, idempotency,
and the explicit server sending switch. A filled honeypot must never call Resend;
return a controlled rejection without exposing detection details.

For public activation, prefer Vercel WAF rate limiting scoped exactly to
`POST /api/contact`, keyed by IP. Proposed enforced limit: 5 requests per
10-minute fixed window, returning 429. Inspect the actual project's available
rule capacity, supported window, and pricing before setup; record any adjustment.
Follow the Vercel firewall skill's staged observation/review process before
enforcement. Document that counters can be regional and IP limits can affect
shared networks. This is basic flood reduction, not complete bot prevention.

The code-ready goal documents the proposed rule and verification procedure;
it does not publish a live firewall change. Do not substitute a process-local
Map and call that reliable serverless rate limiting. If the native control
cannot be used, surface the concrete limitation before adding a datastore or
another protection vendor. Keep live sending disabled until controls are ready.
Add CAPTCHA only if observed abuse justifies the added friction and setup.

## Privacy and future growth

Kenneth requested removing the inline privacy notice and "Prefer email?" line
from the contact page. Keep the footer email and no-JavaScript direct-email
fallback. Review privacy information and its final placement before live sending;
any wording must match the selected mailbox and Resend setup.
Do not describe Resend or mailbox copies as having zero retention. Confirm their
actual retention and Kenneth's deletion practice before operational completion.
No message content, email addresses, or names in analytics/custom events or
application logs; log only safe status categories and opaque identifiers.

Do not add a message database, dashboard, accounts, threads, attachments,
automatic follow-ups, CRM, queue, or delivery webhook in this slice. No payment
flow or business terms are included. Existing Vercel Analytics/theme storage
remain separate considerations for any later site-wide privacy policy.

Future additions can extend the existing handler and delivery module. Add
persistence when there is a real use for stored inquiries, and authentication
when there is an actual private interface. No speculative plugin system or
event bus is needed to preserve those options.

## Implementation sequence and verification

1. Inspect current Git/working-tree state and applicable instructions. Create a
   suitable implementation branch without discarding handoffs or unrelated work.
2. Implement schema, endpoint, and server-only delivery adapter. Verify rejection
   paths do not call the provider. Add configuration examples and brief setup notes.
3. Build the form/page and metadata, update contact navigation and affected tests,
   and generate routes. Keep styling scoped to the contact feature.
4. Add a small set of meaningful checks: valid/invalid boundaries, body/origin
   rejection, honeypot, disabled/missing configuration, fixed sender/recipient and
   Reply-To, provider acceptance/failure/timeout, retry-key stability, and UI text
   preservation/status feedback. Combine related cases; avoid snapshot/style tests.
5. Run the smallest focused checks during iteration, then `pnpm build` once the
   implementation is ready. Its prebuild includes types, tests, and Biome. Repeat
   only for subsequent changes or unresolved failures.
6. Follow the local browser skill for a brief desktop/phone pass in both themes:
   navigation/direct refresh, no overflow, labels/focus, pending/accepted/error
   feedback with intercepted `/api/contact` responses if the available browser
   integration supports that. Otherwise cover simulated feedback in component
   tests and inspect the real disabled/unconfigured state in the browser; do not
   add a production mock endpoint just for screenshots. Check no message loss on
   failure, no accidental real email, metadata/sitemap/API exclusion, and console.
7. Review the final diff and record code-ready evidence plus outstanding external
   dependencies. Stop at a reviewable local change; no push, PR, merge, production
   deployment, account setup, DNS/firewall changes, or actual email in this milestone.

### Code-ready acceptance

- `/contact` and navigation work; legacy anchors remain useful.
- The approved visual style and public account-free access are preserved.
- Form feedback is truthful and accessible; failed messages remain available.
- Provider integration is real code, verified with mocked transport, with secrets
  confined to the server and no build-time email calls.
- Invalid, disabled, and suspicious requests do not trigger delivery.
- Required build and proportionate browser checks pass.
- Live configuration and real inbox delivery are explicitly pending if unavailable.

### Later operational milestone

With Kenneth's separate instruction: choose/purchase domain and mailbox, verify
sender DNS, set environment-scoped configuration, review privacy/retention and
provider limits, stage/review/enforce the scoped WAF rule, authorize a specific
test email to Kenneth, verify inbox receipt and Reply-To, then obtain publication
authorization. Show the real result without claiming a mock proves delivery.

## References checked October 28, 2026

- [TanStack server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes)
  describe POST handlers alongside page routes; installed repository contracts
  remain the implementation baseline.
- [Resend verified domains](https://resend.com/docs/dashboard/domains/introduction)
  require control/verification of a sending domain for normal use.
- [Resend send API](https://resend.com/docs/api-reference/emails/send-email)
  documents sender, recipient, text body, and reply address parameters.
- [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)
  documents request replay protection with a 24-hour window.
- [Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
  documents availability across plans; project limits/configuration still need
  checking at activation time.
