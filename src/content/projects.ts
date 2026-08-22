/** Static, typed project case studies and their build-optimized images. */

import chavosBookingWidget from "#/assets/chavos-parlor/booking-widget.png?gallery";
import chavosGallery from "#/assets/chavos-parlor/gallery.png?gallery";
import chavosHero from "#/assets/chavos-parlor/hero.png?hero";
import chavosHeroThumbnail from "#/assets/chavos-parlor/hero.png?thumb";
import chavosServices from "#/assets/chavos-parlor/services.png?gallery";
import chavosWizardDetails from "#/assets/chavos-parlor/wizard-details.png?gallery";
import chavosWizardService from "#/assets/chavos-parlor/wizard-service.png?gallery";
import chavosWizardTime from "#/assets/chavos-parlor/wizard-time.png?gallery";

export type ProjectStatus = "live" | "prototype" | "private";

export type GalleryImage = {
	picture: ImagetoolsPicture;
	alt: string;
	caption?: string;
};

export type ProjectHighlight = {
	title: string;
	body: string;
};

type ProjectCover = {
	picture: ImagetoolsPicture;
	thumbnail: ImagetoolsPicture;
	alt: string;
};

type CustomFlow = {
	summary: string;
	highlights: readonly ProjectHighlight[];
	gallery: readonly [GalleryImage, ...GalleryImage[]];
};

export type Project = {
	/** Stable lowercase, kebab-case identity used as the route parameter. */
	projectId: string;
	title: string;
	tagline: string;
	cover: ProjectCover;
	role: string;
	year: string;
	status: ProjectStatus;
	stack: readonly string[];
	liveUrl?: string;
	summary: string;
	problem: string;
	productionConstraint?: string;
	approach: string;
	highlights: readonly ProjectHighlight[];
	outcomes: readonly string[];
	gallery: readonly GalleryImage[];
	customFlow?: CustomFlow;
};

export const projects = [
	{
		projectId: "chavos-parlor",
		title: "Chavo's Parlor",
		tagline:
			"A branded home for a working barber shop, with live Square services and an embedded booking flow.",
		cover: {
			picture: chavosHero,
			thumbnail: chavosHeroThumbnail,
			alt: "Chavo's Parlor landing page hero with the shop wordmark and Book Now call to action",
		},
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
				picture: chavosServices,
				alt: "Services menu listing haircuts and prices loaded live from the Square catalog",
				caption:
					"Service menu, fed live from Square Catalog with a fail-open fallback.",
			},
			{
				picture: chavosGallery,
				alt: "Photo gallery section of the Chavo's Parlor site",
				caption:
					"Work samples stay fast with responsive, lazy-loaded WebP images.",
			},
			{
				picture: chavosBookingWidget,
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
					picture: chavosWizardService,
					alt: "Sandbox custom booking wizard step one: choosing a service",
					caption: "Sandbox build — service selection backed by URL state.",
				},
				{
					picture: chavosWizardTime,
					alt: "Sandbox custom booking wizard step two: picking an appointment time",
					caption:
						"Sandbox build — live availability rendered in the shop's timezone.",
				},
				{
					picture: chavosWizardDetails,
					alt: "Sandbox custom booking wizard step three: entering contact details",
					caption:
						"Sandbox build — contact inputs feed the idempotency boundary.",
				},
			],
		},
	},
] as const satisfies readonly Project[];

/** The first project is the homepage's editorial selection. */
export const featuredProject: Project = projects[0];

export function getProject(projectId: string): Project | undefined {
	return projects.find((project) => project.projectId === projectId);
}
