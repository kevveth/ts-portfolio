/**
 * Site-wide identity and links. Single edit point — components read from here
 * and never hardcode shared copy or URLs.
 *
 * Keep this module dependency-free (no `#/` imports): it's a leaf imported
 * broadly — client components for meta, server routes (robots.txt), and the
 * Vitest content tests — so it must not pull in app or build-only code.
 */

// Resolved at build time from Vercel's VERCEL_PROJECT_PRODUCTION_URL via the
// `define` in vite.config.ts; falls back to localhost for dev/test.
export const SITE_URL =
	import.meta.env.VITE_SITE_URL ?? "http://localhost:3000";

export const SITE = {
	name: "Kenneth Rathbun",
	role: "Full-stack developer",
	headline: "I design and ship production web apps, end to end.",
	bio: "Most recently: a production site for a working barber shop — brand, UI, live Square services, and an embedded booking flow shaped around the account's real constraints. I care about strict boundaries, failure modes, and the details that make software feel fast.",
	metaDescription:
		"Full-stack developer building production web apps end to end — most recently a Square-connected site for a working barber shop.",
	email: "dev.kenrathbun@gmail.com",
	github: "https://github.com/kevveth",
	siteRepo: "https://github.com/kevveth/ts-portfolio",
	githubUsername: "kevveth",
	linkedin: "https://www.linkedin.com/in/kenneth-rathbun",
	// Hardcoded because a prerendered current year still goes stale between deploys.
	copyrightYear: "2026",
} as const;
