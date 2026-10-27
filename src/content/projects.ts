/**
 * Adapted from barber-shop/docs/portfolio-case-study.md, October 26, 2026.
 * Media provenance: src/assets/chavos-parlor/README.md.
 */
import chavosDesktop from "#/assets/chavos-parlor/production-desktop.png?hero";
import chavosThumbnail from "#/assets/chavos-parlor/production-desktop.png?thumb";
import chavosPhone from "#/assets/chavos-parlor/production-mobile.png?gallery";

export type ProjectStatus = "live" | "prototype" | "private";
export type GalleryImage = {
	picture: ImagetoolsPicture;
	alt: string;
	caption?: string;
};
export type ProjectHighlight = { title: string; body: string };
export type Project = {
	projectId: string;
	title: string;
	tagline: string;
	cover: {
		picture: ImagetoolsPicture;
		thumbnail: ImagetoolsPicture;
		alt: string;
	};
	socialImage: string;
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
};

export const projects = [
	{
		projectId: "chavos-parlor",
		title: "Chavo’s Parlor",
		tagline: "A distinctive website around an existing booking workflow.",
		cover: {
			picture: chavosDesktop,
			thumbnail: chavosThumbnail,
			alt: "Chavo’s Parlor production website, captured October 26, 2026",
		},
		socialImage: "/og/chavos-parlor.jpg",
		role: "Design & development",
		year: "2026",
		status: "live",
		stack: [
			"TypeScript",
			"React",
			"TanStack Start",
			"Tailwind",
			"Square SDK",
			"Vercel",
			"Vitest",
			"Playwright",
		],
		liveUrl: "https://chavosparlor.com/",
		summary:
			"Chavo’s Parlor is a neighborhood barber shop in San Diego. I built a branded, mobile-first marketing website for my longtime barber, without payment. It helps customers understand the shop, browse its services, and reach its existing Square booking experience.",
		problem:
			"The shop needed a distinctive public home without another system to maintain. Services, reviews, hours, location, and arrival instructions now sit together, with bold typography, a dark background, a rust accent, and approved photography of the barber’s work.",
		approach:
			"Square owns scheduling, customer records, and payments. The website reads the service catalog and regular location hours, so the barber does not maintain a second price list or weekly schedule. Booking opens Square’s official widget, with a hosted-page fallback. Native booking links also work without JavaScript. Staff availability and holiday exceptions remain outside the hours sync.",
		highlights: [
			{
				title: "Keep the workflow familiar",
				body: "I explored a custom booking/payment flow, then simplified the maintained application around the service the barber already uses. The experiment is retired in Git history, rather than maintained behind a feature flag.",
			},
			{
				title: "Handle an unavailable menu honestly",
				body: "The integration validates Square’s catalog and stores a private snapshot of a complete public menu. It can label an older menu during a temporary outage and stop displaying it after a defined age. It never substitutes invented services or prices.",
			},
			{
				title: "Keep testing separate from the shop",
				body: "Development and Preview use Square sandbox configuration and a local booking stub. Automated browser tests exercise the compiled application, including native links, redirects, metadata, and booking-modal fallback.",
			},
			{
				title: "Check the delivered experience",
				body: "Accessibility checks cover mobile reflow, keyboard focus, booking controls, contrast, and page structure. Separate deployed checks exercised the real Square form’s keyboard entry, labels, Close/focus restoration, and hosted fallback, without submitting an appointment or payment.",
			},
		],
		outcomes: [
			"The simplified integration launched October 21, 2026; regular location-hours sync was accepted October 23.",
			"The October 26 release passed real catalog, private snapshot, isolated recovery, widget/fallback, and Production health checks.",
			"This demonstrates a delivered local-business website. No increase in bookings, revenue, or conversion rate has been established.",
		],
		gallery: [
			{
				picture: chavosPhone,
				alt: "Full Chavo’s Parlor phone production capture from October 26, 2026",
				caption: "Real Production capture · October 26, 2026 · phone",
			},
		],
	},
] as const satisfies readonly Project[];

export const featuredProject: Project = projects[0];
export function getProject(projectId: string): Project | undefined {
	return projects.find((project) => project.projectId === projectId);
}
