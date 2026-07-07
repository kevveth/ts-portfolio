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
import { Button } from "#/components/ui/button";
import { SITE, SITE_URL } from "#/content/site";
import { THEME_INIT_SCRIPT } from "#/lib/theme";
import appCss from "../styles.css?url";

const DEFAULT_TITLE = `${SITE.name} — ${SITE.role}`;

const PRELOADED_FONTS = [
	"ibm-plex-sans-400",
	"ibm-plex-sans-700",
	"ibm-plex-mono-500",
];

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
			{ name: "twitter:card", content: "summary_large_image" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", type: "image/png", href: "/favicon-32.png" },
			{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
			{ rel: "manifest", href: "/manifest.json" },
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
				<HeadContent />
			</head>
			<body className="flex min-h-svh flex-col">
				<SiteHeader />
				<main className="flex-1">{children}</main>
				<SiteFooter />
				<Analytics />
				<Scripts />
			</body>
		</html>
	);
}

function NotFound() {
	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-4 py-24 sm:px-6">
			<p className="kicker">404 — not found</p>
			<h1 className="text-3xl font-semibold tracking-tight">
				This page doesn't exist.
			</h1>
			<p className="text-muted-foreground">
				The address may be mistyped, or the page may have moved.
			</p>
			<Button asChild variant="outline">
				<Link to="/">Back home</Link>
			</Button>
		</div>
	);
}
