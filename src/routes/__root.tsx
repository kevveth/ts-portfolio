import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import type { ReactNode } from "react";

import { SiteFooter } from "#/components/site-footer";
import { SiteHeader } from "#/components/site-header";
import { SITE, SITE_URL } from "#/content/site";
import { THEME_COLORS, THEME_INIT_SCRIPT } from "#/lib/theme";
import appCss from "../styles.css?url";

const DEFAULT_TITLE = SITE.name;

// Variable fonts: one file per subset covers the whole weight range, so only
// the latin subset needs preloading for page copy and monospace labels.
// latin-ext loads lazily if extended-Latin text shows up.
const PRELOADED_FONTS = ["space-grotesk-latin", "jetbrains-mono-latin"];

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: DEFAULT_TITLE },
			{ name: "description", content: SITE.metaDescription },
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: SITE.name },
			{ property: "og:title", content: DEFAULT_TITLE },
			{ property: "og:description", content: SITE.metaDescription },
			{ property: "og:image", content: `${SITE_URL}/og.png` },
			{ property: "og:image:type", content: "image/png" },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{
				property: "og:image:alt",
				content:
					"Kenneth Rathbun in an emerald green name block. Developer, skateboarder, barista. Work, about, contact.",
			},
			{ name: "twitter:image", content: `${SITE_URL}/og.png` },
			{
				name: "twitter:image:alt",
				content:
					"Kenneth Rathbun in an emerald green name block. Developer, skateboarder, barista. Work, about, contact.",
			},
			{ name: "twitter:card", content: "summary_large_image" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", type: "image/png", href: "/favicon-32.png" },
			{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
			{ rel: "manifest", href: "/manifest.json" },
			// rel="me" consolidates these profiles with this domain
			// (IndieAuth/Mastodon-style verification).
			{ rel: "me", href: SITE.github },
			{ rel: "me", href: SITE.linkedin },
			...PRELOADED_FONTS.map((font) => ({
				rel: "preload",
				as: "font",
				type: "font/woff2",
				href: `/fonts/${font}.woff2`,
				crossOrigin: "anonymous" as const,
			})),
		],
		// Pre-paint theme + `js` class stamp; must run before first paint.
		scripts: [{ children: THEME_INIT_SCRIPT }],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Rendered here, not via head().meta: the head manager dedupes
				    meta by `name`, so only one of the two media-scoped
				    theme-color tags would survive. */}
				<meta
					name="theme-color"
					media="(prefers-color-scheme: light)"
					content={THEME_COLORS.light}
					suppressHydrationWarning
				/>
				<meta
					name="theme-color"
					media="(prefers-color-scheme: dark)"
					content={THEME_COLORS.dark}
					suppressHydrationWarning
				/>
				<HeadContent />
			</head>
			<body className="flex min-h-svh flex-col">
				{/* Let keyboard users reach each page's main content directly. */}
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-brand"
				>
					Skip to content
				</a>
				<SiteHeader />
				<main id="main-content" tabIndex={-1} className="flex-1">
					{children}
				</main>
				<SiteFooter />
				<Analytics />
				<Scripts />
			</body>
		</html>
	);
}

function NotFound() {
	return (
		<article className="site-frame about-page">
			<p className="index-label">404 — not found</p>
			<h1 className="index-label">This page doesn't exist.</h1>
			<p>The address may be mistyped, or the page may have moved.</p>
			<Link to="/" className="detail-link story-actions">
				<span className="link-label">back home</span>
			</Link>
		</article>
	);
}
