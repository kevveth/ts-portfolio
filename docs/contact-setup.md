# Contact form operations

## Current application behavior

The current frontend reads server availability; it is not permanently disabled.
Production sending and inbox delivery were verified on November 3, 2026, as
recorded under launch history below. That dated evidence does not establish the
current state of external provider settings or deployment configuration.

The form and endpoint are implemented. Live delivery is disabled by default.
The contact-page loader reads server configuration and exposes only an enabled
boolean to the browser. The page is not prerendered, and its HTML is marked
`no-store`, so a deployment's runtime configuration controls availability.
No mailbox, sending account, or firewall configuration is provisioned by code.

The disabled form keeps its send button disabled and displays
“coming soon — use email below.” `ContactForm` defaults to `enabled={false}`
and ignores form submission events while disabled. Enabling sending in a new
environment requires the runtime configuration and operational checks below.
The page passes the runtime availability flag to the frontend; the component
itself still defaults to disabled when rendered without that flag.

The frontend uses TanStack Form with the shared Zod validation rules. It shows
field errors after a submit attempt, retains values on failed delivery, and
resets the message and optional subject after confirmed provider acceptance.
The subject is a single line of up to 200 characters, included in the email body;
the email's actual Subject header remains fixed. The plain labels retain native
required semantics for email/message without a visible suffix.

## Runtime configuration

Set these variables in the server process/deployment environment, using the
names in `.env.example`. The server reads `process.env` at request time:

| Variable | Value |
| --- | --- |
| `CONTACT_FORM_ENABLED` | Exactly `true` to enable; every other value disables |
| `RESEND_API_KEY` | Private Resend sending key scoped to the verified domain |
| `CONTACT_FROM_EMAIL` | A verified sender email address, without a display name |
| `CONTACT_TO_EMAIL` | Kenneth's chosen fixed recipient email |
| `CONTACT_ALLOWED_ORIGINS` | Comma-separated exact origins, e.g. `https://portfolio.example` |

Malformed or missing configuration returns HTTP 503 and a direct-email fallback.
Never prefix these private settings with `VITE_`. The public correspondence
address remains `SITE.email`; change it only after Kenneth selects its replacement.
Keep preview/development variables disabled and separate from production.

Vite exposes public prefixed variables through `import.meta.env`; this handler
instead consumes runtime server environment variables. For local work, exported
shell variables are inherited by `pnpm dev`; do not assume a Vite-loaded `.env`
value is also populated into Node's `process.env`. No local secret file is
needed for the disabled form or mocked tests. Do not overwrite existing `.env`
files or use production secrets in browser tests.

## Provisioning or re-enabling delivery

Use this checklist for a new environment or changed sending setup. The initial
Production setup and delivery checks are recorded as completed in launch history;
do not repeat DNS changes, provisioning, or live messages merely to verify a code
change. Recheck only the external controls relevant to the operation being made.

1. Confirm the destination mailbox can receive and reply. Kenneth selected
   `hello@kenrathbun.dev` in iCloud Mail; a paid mailbox is not required.
2. Create/configure Resend separately, verify a sending domain or subdomain,
   and review the required DNS records against the mailbox's existing records.
   Keep a narrowly scoped sending key private.
3. Set the exact trusted browser origins for the intended website domain(s).
   No wildcard preview domains or arbitrary forwarded host headers are trusted.
4. Review the privacy information and its placement against the chosen mailbox and Resend's
   actual retention. Agree on an inbox deletion practice. No zero-retention
   claim is made. The inline contact-page notice was removed at Kenneth's request;
   privacy information is now on `/privacy`, linked from Contact and the footer.
   Kenneth selected a 90-day inbox deletion practice for inquiries that do not
   become client work on November 3, 2026; this is manual inbox maintenance,
   not automatic deletion or a promise about provider backups. Disable
   provider-side open/click tracking in account settings.
5. Inspect the actual Vercel project's WAF rule capacity, available windows,
   limits, and pricing when changing controls. The recorded Production rule is
   scoped to exact path `/api/contact`, method
   `POST`, fixed window of 600 seconds, 5 requests per source IP, excess -> 429.
   Follow the Vercel firewall skill's staged observation/review process before
   enforcement. Do not affect public GET requests or unrelated endpoints.
   Counters can be regional and shared networks may share one IP limit.
   Do not replace this control with a process-local counter in serverless code.
6. With explicit authorization, send a specific test inquiry to Kenneth, verify
   actual inbox receipt, inspect Reply-To, and test failures/limits without
   sending repeated real messages. Mocked tests do not establish deliverability.
7. Set `CONTACT_FORM_ENABLED=true` only after controls/configuration are ready and publication
   is authorized. Missing configuration must never be treated as a successful send.

The app's honeypot, strict schema, actual byte cap, allowed origins, fixed
recipient and provider idempotency are already implemented. They reduce misuse
but do not replace request rate limiting or prove a visitor is human. CAPTCHA
and persistent storage can be evaluated later if actual abuse warrants them.

## Submission behavior and recovery

- One plain-text email goes to the configured inbox. The visitor's validated
  email is Reply-To; browser input cannot change sender, recipient or subject.
- HTTP 200 / `accepted` requires a successful provider response with an email ID.
  This confirms acceptance, not arrival in the inbox. No auto-reply is sent.
- Network, timeout, malformed acceptance and provider errors return a safe failure.
  The UI keeps the message and permits a manual retry or direct email.
- Retries of unchanged content reuse a submission ID and a Resend idempotency
  key. Editing begins a new attempt. Resend's current replay window is 24 hours;
  there is no permanent message store or exactly-once delivery claim.
- To stop delivery, set `CONTACT_FORM_ENABLED=false` in the runtime environment
  and apply the hosting platform's normal configuration rollout. The form then
  returns unavailable and retains the direct email option. No data migration is
  needed to roll back the code; `/#contact` still reaches the footer.
- Never log message content, names, email addresses, API keys or provider bodies.

## Verification

Use `pnpm test`, or run focused contact tests while iterating. Tests replace the
HTTP transport at the request boundary and never contact Resend. `pnpm build`
is the required completion gate (types, tests, Biome, then production build).
Browser review uses the local disabled endpoint. There is no public mock-success
switch, and rendering/prerender/build do not invoke the sending API.

## Launch history — November 3, 2026

These are dated provisioning and delivery observations, not outstanding tasks.
The hard-disabled frontend described during endpoint testing was an earlier
deployment; the current route uses runtime availability as described above.

- Primary website: `https://www.kenrathbun.dev`.
- Resend domain: `mail.kenrathbun.dev`, verified. Sender:
  `contact@mail.kenrathbun.dev`. iCloud's root-domain mail records are preserved.
- `RESEND_API_KEY` is a Production-only Secret, entered by Kenneth. A
  sending-only replacement was created and the former Full access key removed.
  Never read back or print this value during verification.
- Sender, destination, allowed origin, and delivery flag are saved for
  Production. Configuration changes require a new deployment.
- WAF rule `rule_portfolio_contact_limit_preview_UfQNYQ` was tested in Preview:
  five empty POSTs returned 503 (delivery disabled), then two returned 429.
  Kenneth published the Production-only version with a 600-second fixed window,
  five attempts per IP, 429 response, exact `/api/contact` path and POST method.
  Active configuration version 3 was verified. This is a regional per-IP
  control, not a global quota or bot identity check.
- Kenneth authorized one test inquiry to `hello@kenrathbun.dev`, Reply-To
  `dev.kenrathbun@gmail.com`. Existing Production commit `3366067` was redeployed
  as `dpl_42SyHQoVvH1QJej18qP5CBCzLSij` with server delivery enabled; its existing
  frontend was still hard-disabled during that test. The endpoint returned
  200 / `accepted` once.
  Resend email `01a1a0de-0a5d-763e-a705-d62c289bb114` reports Delivered, and its
  sender and Reply-To were inspected. Kenneth confirmed receipt in Updates and
  the correct reply target, but Mail displayed a sender-verification warning.
- Added TXT `_dmarc.mail.kenrathbun.dev` = `v=DMARC1; p=none;` (TTL 60),
  scoped to the Resend sending subdomain. Public DNS returned the record.
  Kenneth authorized one follow-up test; submission
  `49809d5f-8f58-4a76-aaa9-9882a48e25b7` returned 200 / `accepted`.
  Resend email `01a1a0e8-1247-7af4-8b00-3b095f0db296` reports Delivered,
  and its Insights now marks DMARC valid with no attention items. Kenneth confirmed the sender-verification warning is gone on this fresh
  message. Delivery verification is complete. No additional messages were sent.

References: [Resend domain setup](https://resend.com/docs/dashboard/domains/introduction),
[send API](https://resend.com/docs/api-reference/emails/send-email),
[idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), and
[Vercel rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).
