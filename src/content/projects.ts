/**
 * Project case studies. Hardcoded, typed content — adding a project is a new
 * entry here plus its gallery images in src/assets/<slug>/ (registered in
 * src/lib/project-images.ts).
 *
 * Gallery `src` values are string keys, not imports, so this module stays
 * pure and node-testable; components resolve keys through project-images.ts.
 *
 * Chavo's Parlor facts were cross-checked against the real repo
 * (~/Documents/projects/barber-shop) on 2026-07-05: idempotency key scheme,
 * deposits saga, wizard search-param validation, fail-open catalog, PII
 * sanitizer, honeypot, security headers, Intl timezone handling, and the
 * 37-test-file count are all verifiable there. The testimonial and review
 * aggregate are verbatim from its src/content/reviews.ts (captured
 * 2026-06-30).
 */

/** Lifecycle state of a project, shown as a labeled status indicator. */
export type ProjectStatus = "live" | "prototype" | "private";

/**
 * Presentation metadata per status. `dotClass` colors the indicator dot,
 * `badgeClass` tints the badge (border/background/text) so a status stands out
 * from the neutral outline stack chips, and `live` flags the pulsing "ping"
 * ring. Adding a status (e.g. "archived") is one entry here plus one member on
 * ProjectStatus.
 */
export const STATUS_META: Record<
	ProjectStatus,
	{ label: string; dotClass: string; badgeClass: string; live: boolean }
> = {
	live: {
		label: "Live",
		dotClass: "bg-green-500",
		badgeClass:
			"border-green-600/40 bg-green-500/10 text-green-800 dark:border-green-400/40 dark:text-green-400",
		live: true,
	},
	prototype: {
		label: "Prototype",
		dotClass: "bg-violet-500",
		badgeClass:
			"border-violet-600/40 bg-violet-500/10 text-violet-700 dark:border-violet-400/40 dark:text-violet-400",
		live: false,
	},
	private: {
		label: "Private",
		dotClass: "bg-zinc-500",
		badgeClass:
			"border-zinc-500/40 bg-zinc-500/10 text-zinc-700 dark:border-zinc-400/40 dark:text-zinc-300",
		live: false,
	},
};

export function getStatusMeta(status: ProjectStatus) {
	return STATUS_META[status];
}

export type GalleryImage = { src: string; alt: string; caption?: string };

export type Project = {
	slug: string;
	title: string;
	tagline: string;
	role: string;
	year: string;
	status: ProjectStatus;
	stack: string[];
	liveUrl?: string;
	repoUrl?: string;
	featured: boolean;
	summary: string;
	problem: string;
	approach: string;
	highlights: { title: string; body: string }[];
	outcomes: string[];
	testimonial?: { quote: string; author: string };
	gallery: [GalleryImage, ...GalleryImage[]];
};

const PROJECTS: Project[] = [
	{
		slug: "chavos-parlor",
		title: "Chavo's Parlor",
		tagline:
			"A branded, faster booking experience that replaces a generic Square page — with Square kept as the source of truth.",
		role: "Design & full-stack build",
		year: "2026",
		status: "live",
		stack: [
			"TanStack Start",
			"React 19",
			"TypeScript",
			"Tailwind v4",
			"Square SDK",
			"Zod",
			"Vitest",
			"Playwright",
			"Vercel",
		],
		liveUrl: "https://www.chavosparlor.com",
		featured: true,
		summary:
			"A custom site for a San Diego barber shop, designed and built end to end: brand, UI, and a Square-backed booking engine. Live in production at chavosparlor.com.",
		problem:
			"The shop relied on Square's generic hosted booking page — off-brand, slower than it needed to be, and with no control over UX, performance, or SEO. Customers deserved a site that feels like Chavo's, not like Square.",
		approach:
			"The architecture draws a strict server/client boundary: pure business logic lives in src/domain/ (fully unit-tested, no IO), and every Square API call is isolated in src/server/, which components can never import directly. Square stays the system of record — there is no custom database to operate, sync, or reconcile, which keeps operational risk near zero for a one-person shop. The entire rollout is env-driven: SQUARE_ENV flips sandbox ↔ production and BOOKING_MODE flips the hosted Square flow ↔ the custom booking engine, so cutovers are config changes, not code changes.",
		highlights: [
			{
				title: "Idempotent booking saga",
				body: "A deterministic v2 idempotency key derived from normalized contact info means double-taps and network retries can never double-book. Slot conflicts are detected by Square error category and code — never guessed from HTTP status.",
			},
			{
				title: "Deposits without double-charges",
				body: "Card deposits follow an authorize → book → capture saga. The hold is voided if booking fails, and a capture failure never cancels a confirmed booking — it emits a reconciliation alert and a seller note instead.",
			},
			{
				title: "URL-as-state booking wizard",
				body: "The entire four-step booking flow lives in Zod-validated URL search params, so refresh, the back button, and shared links always resolve to a consistent, canonical state.",
			},
			{
				title: "Fail-open resilience",
				body: "The live Square catalog fetch falls back to a placeholder service menu so the page never blanks, and the environment is Zod-validated at server start — misconfiguration fails loudly at boot, not silently at 2pm on a Saturday.",
			},
			{
				title: "Privacy & security",
				body: "A PII sanitizer keeps emails and phone numbers out of logs, a honeypot field rejects spam before any external call, the location map is a self-hosted static image (zero third-party requests), and strict security headers — HSTS, nosniff, X-Frame-Options DENY, Permissions-Policy — ship on every response.",
			},
			{
				title: "Performance",
				body: 'Above-the-fold woff2 fonts are preloaded, the hero image loads with fetchPriority="high", the gallery and map lazy-load, assets ship as WebP, and fontaine\'s metric-matched font fallbacks eliminate layout shift.',
			},
			{
				title: "Accessibility",
				body: "An automated axe-core gate runs with the test suite, oklch colors are tuned to WCAG AA/AAA, focus is always visible, and all motion respects prefers-reduced-motion.",
			},
			{
				title: "Timezone-correct availability",
				body: "Appointment slots render in the shop's timezone (America/Los_Angeles) correctly across PST/PDT transitions using only native Intl.DateTimeFormat — no date library in the bundle.",
			},
		],
		outcomes: [
			"Live in production as the shop's public site at chavosparlor.com",
			"Square remains the system of record — zero data migration and no new operational burden for the owner",
			"The shop holds a 5.0★ rating across 61 Google reviews (captured 2026-06-30)",
			"37 test files across Vitest, Playwright, and axe-core back the build's correctness claims",
		],
		testimonial: {
			quote:
				"I just spent an hour on the seat of the best barber in San Diego County! … I think he's the best barber in California. … He is the best barber in the United States of America.",
			author: "Henry L., Google review of Chavo's Parlor",
		},
		gallery: [
			{
				src: "chavos-parlor/hero",
				alt: "Chavo's Parlor landing page hero with the shop wordmark and Book Now call to action",
				caption: "Landing hero — dark, brand-forward, fast first paint.",
			},
			{
				src: "chavos-parlor/services",
				alt: "Services menu listing haircuts and prices loaded live from the Square catalog",
				caption:
					"Service menu, fed live from Square Catalog with a fail-open fallback.",
			},
			{
				src: "chavos-parlor/gallery",
				alt: "Photo gallery section of the Chavo's Parlor site",
				caption: "Lazy-loaded WebP gallery.",
			},
			{
				src: "chavos-parlor/wizard-service",
				alt: "Booking wizard step one: choosing a service",
				caption:
					"Booking wizard — every step lives in validated URL search params.",
			},
			{
				src: "chavos-parlor/wizard-time",
				alt: "Booking wizard step two: picking an appointment time from available slots",
				caption:
					"Availability rendered in the shop's timezone via native Intl.",
			},
			{
				src: "chavos-parlor/wizard-details",
				alt: "Booking wizard step three: entering contact details",
				caption:
					"Contact step — inputs feed the deterministic idempotency key.",
			},
		],
	},
];

export function getAllProjects(): Project[] {
	return PROJECTS;
}

export function getProject(slug: string): Project | undefined {
	return PROJECTS.find((project) => project.slug === slug);
}

export function getFeaturedProject(): Project {
	const featured = PROJECTS.find((project) => project.featured);
	if (!featured) {
		throw new Error(
			"No featured project configured in src/content/projects.ts",
		);
	}
	return featured;
}
