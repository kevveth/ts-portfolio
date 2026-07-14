/**
 * Project case studies. Hardcoded, typed content — adding a project is a new
 * entry here plus its gallery images in src/assets/<slug>/ (registered in
 * src/lib/project-images.ts).
 *
 * Gallery `src` values are string keys, not imports, so this module stays
 * pure and node-testable; components resolve keys through project-images.ts.
 *
 * Chavo's Parlor facts were cross-checked against the real repo
 * (~/Documents/projects/barber-shop) on 2026-07-13. Production uses Square's
 * official embedded booking widget because Chavo's Free Appointments plan
 * rejects Bookings API writes; the custom API flow remains feature-gated and
 * is not presented as live. The production highlights and test-file count are
 * grounded in that repository rather than inferred from the sandbox UI.
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

export type ProjectHighlight = { title: string; body: string };

export type CustomFlow = {
	summary: string;
	highlights: ProjectHighlight[];
	gallery: [GalleryImage, ...GalleryImage[]];
};

export type Project = {
	slug: string;
	title: string;
	tagline: string;
	thumbAlt: string;
	role: string;
	year: string;
	status: ProjectStatus;
	stack: string[];
	liveUrl?: string;
	repoUrl?: string;
	featured: boolean;
	summary: string;
	problem: string;
	productionConstraint?: string;
	approach: string;
	highlights: ProjectHighlight[];
	outcomes: string[];
	gallery: [GalleryImage, ...GalleryImage[]];
	customFlow?: CustomFlow;
};

const PROJECTS: Project[] = [
	{
		slug: "chavos-parlor",
		title: "Chavo's Parlor",
		tagline:
			"A branded home for a working barber shop, with live Square services and an embedded booking flow.",
		thumbAlt:
			"Chavo's Parlor landing page hero with the shop wordmark and Book Now call to action",
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
			"I designed and built Chavo's public site end to end: brand, UI, live services, and a Square-hosted booking flow that opens without sending customers away. A custom API flow is also designed and tested behind a feature flag, ready if the shop's plan changes.",
		problem:
			"Square handled appointments, but its hosted page did not tell Chavo's story. Customers had no branded place to see the work, scan the full service menu, read reviews, or get the practical details before booking. The goal was to own that experience without giving the shop another system to run.",
		productionConstraint:
			"The custom flow worked end to end in Square's sandbox. At production cutover, Chavo's Free Appointments plan rejected every Bookings API write. Rather than add a monthly bill just to unlock my custom UI, I kept the shop on Free and shipped Square's supported widget inside the site.",
		approach:
			"I kept the branded experience and the booking boundary separate. Services come from the live Square Catalog, the supported widget opens in a modal, and Square remains the system of record. An environment switch controls which booking path is active, so a future plan change is configuration—not a rewrite.",
		highlights: [
			{
				title: "Tier-aware booking rollout",
				body: "Plain clicks open Square's supported widget in a branded modal; modified clicks and no-JavaScript visits keep a real hosted-booking link. If the embed ever regresses, customers still have an explicit escape hatch to Square.",
			},
			{
				title: "Live catalog, watched in production",
				body: "The service menu reads from Chavo's Square Catalog and fails open if Square is unavailable. A scheduled health check catches stale credentials or placeholder data and opens a GitHub issue instead of letting a quiet catalog failure linger.",
			},
			{
				title: "Privacy and performance",
				body: "The map is self-hosted, logs strip customer PII, and strict security headers ship on every response. Fonts are preloaded, imagery is WebP, below-the-fold media lazy-loads, and metric-matched fallbacks keep the first paint steady.",
			},
			{
				title: "Quality gates",
				body: "Thirty-nine test files cover the shipped and feature-gated paths across Vitest and Playwright. Axe-core runs with the suite, focus stays visible, controls meet touch-target minimums, and motion respects reduced-motion preferences.",
			},
		],
		outcomes: [
			"Live in production as the shop's public site at chavosparlor.com",
			"Kept Chavo on the Free tier instead of adding a monthly bill just to unlock a custom UI",
			"Square remains the system of record — no data migration and no second dashboard for the shop",
		],
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
				caption:
					"Work samples stay fast with responsive, lazy-loaded WebP images.",
			},
			{
				src: "chavos-parlor/booking-widget",
				alt: "Square's service picker open inside the Chavo's Parlor booking modal",
				caption:
					"Live booking — Square's supported widget, kept inside the branded site.",
			},
		],
		customFlow: {
			summary:
				"Before cutover, I built the internal flow end to end against Square's sandbox: service selection, live availability, customer details, booking, and a $15 card deposit. When the plan blocked production writes, I left the flow behind the environment switch instead of pushing Chavo into an upgrade. If he moves to Square Plus later, the path is already designed and tested.",
			highlights: [
				{
					title: "URL-as-state wizard",
					body: "The four-step flow lives in Zod-validated search params, so refresh, back, and shared links always resolve to a canonical state.",
				},
				{
					title: "Idempotent booking",
					body: "A deterministic key derived from normalized contact info protects double-taps and retries, while Square error codes—not HTTP guesses—identify slot conflicts.",
				},
				{
					title: "Safe deposit saga",
					body: "Card deposits authorize before booking and capture after it. Failed bookings void the hold; failed captures never erase a confirmed appointment and instead raise a reconciliation alert.",
				},
				{
					title: "Timezone-correct availability",
					body: "Slots render in America/Los_Angeles across PST and PDT using native Intl.DateTimeFormat, with no date library added to the bundle.",
				},
			],
			gallery: [
				{
					src: "chavos-parlor/wizard-service",
					alt: "Sandbox custom booking wizard step one: choosing a service",
					caption: "Sandbox build — service selection backed by URL state.",
				},
				{
					src: "chavos-parlor/wizard-time",
					alt: "Sandbox custom booking wizard step two: picking an appointment time",
					caption:
						"Sandbox build — live availability rendered in the shop's timezone.",
				},
				{
					src: "chavos-parlor/wizard-details",
					alt: "Sandbox custom booking wizard step three: entering contact details",
					caption:
						"Sandbox build — contact inputs feed the idempotency boundary.",
				},
			],
		},
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
