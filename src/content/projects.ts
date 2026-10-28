/**
 * Adapted from barber-shop/docs/portfolio-case-study.md, October 26, 2026.
 * Media provenance: src/assets/chavos-parlor/README.md.
 */
import chavosDesktop from "#/assets/chavos-parlor/production-desktop.png?hero";
import chavosThumbnail from "#/assets/chavos-parlor/production-desktop.png?thumb";
import chavosDesktopFull from "#/assets/chavos-parlor/production-desktop.png?url";
import chavosPhone from "#/assets/chavos-parlor/production-mobile.png?gallery";
import chavosPhoneFull from "#/assets/chavos-parlor/production-mobile.png?url";

export type ProjectStatus = "live" | "prototype" | "private";
export type GalleryImage = {
	fullSrc: string;
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
		fullSrc: string;
		picture: ImagetoolsPicture;
		thumbnail: ImagetoolsPicture;
		alt: string;
	};
	socialImage: string;
	socialImageAlt: string;
	role: string;
	year: string;
	status: ProjectStatus;
	stack: readonly string[];
	liveUrl?: string;
	publication: { dateTime: string; label: string };
	story: readonly string[];
	summary: string;
	implementation: string;
	productionConstraint?: string;
	approach: string;
	highlights: readonly ProjectHighlight[];
	gallery: readonly GalleryImage[];
};

export const projects = [
	{
		projectId: "chavos-parlor",
		title: "Chavo’s Parlor",
		tagline:
			"A responsive barber-shop website integrated with Square’s service catalog, location hours, and booking widget.",
		cover: {
			fullSrc: chavosDesktopFull,
			picture: chavosDesktop,
			thumbnail: chavosThumbnail,
			alt: "Chavo’s Parlor production website, captured October 26, 2026",
		},
		socialImage: "/og/chavos-parlor.jpg",
		socialImageAlt:
			"Chavo’s Parlor case study by Kenneth Rathbun, with a crop of the October 26, 2026 production website capture",
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
		publication: { dateTime: "2026-10", label: "October 2026" },
		story: [
			"I designed and built a website for my longtime barber, Chavo’s Parlor in San Diego, bringing services, reviews, hours, location, and Square booking together.",
			"Built with TypeScript, React, TanStack Start, and Tailwind, it reads prices and regular hours from Square. Square handles appointments and payments, with a hosted booking page as a fallback.",
			"The catalog validates responses and can show a saved menu during outages. Testing covered mobile layouts, keyboard navigation, contrast, booking controls, and the live Square form.",
		],
		summary:
			"I designed and developed a responsive website for my longtime barber, Chavo’s Parlor in San Diego. It brings services, reviews, hours, and location information together and connects customers to Square booking. The site launched in October 2026.",
		implementation:
			"I built the site with TypeScript, React, TanStack Start, and Tailwind. The design combines bold typography, a dark background, a rust accent, and photography of the barber’s work. On mobile, a persistent booking control keeps booking accessible while customers browse.",
		approach:
			"The website uses the shop’s existing Square account for service prices, regular hours, and booking. This avoids maintaining a separate price list or scheduling system. Square manages scheduling, customer records, and payments. Booking opens Square’s official widget, with a hosted booking page as a fallback. Native booking links also work without JavaScript.",
		highlights: [
			{
				title: "Testing and reliability",
				body: "The catalog integration validates responses and can display a saved menu with a notice during temporary outages. Menus are removed once they exceed the configured age limit. Testing covered mobile layouts, keyboard navigation, contrast, page structure, booking controls, and the hosted booking fallback. Separate checks on the live site covered the Square form’s labels, keyboard navigation, and focus behavior.",
			},
		],
		gallery: [
			{
				fullSrc: chavosPhoneFull,
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
