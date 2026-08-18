import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { FontaineTransform } from "fontaine";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";

// Marker queries (image.png?hero / ?gallery / ?thumb) expand to full
// imagetools directive sets, so image imports stay short and typeable via
// the ambient modules in src/images.d.ts.
const IMAGE_PRESETS: Record<string, Record<string, string>> = {
	hero: { w: "768;1280;1920", format: "avif;webp;png", as: "picture" },
	gallery: { w: "640;1024;1440", format: "avif;webp;png", as: "picture" },
	thumb: { w: "480;768", format: "avif;webp;png", as: "picture" },
	credential: {
		w: "640;1024;1600;2400",
		format: "avif;webp;png",
		as: "picture",
	},
};

// Vercel injects VERCEL_PROJECT_PRODUCTION_URL (host only, no protocol) at
// build time; fall back to an explicit override or localhost for local/dev
// builds. Computed here (rather than imported from src/content/site.ts)
// because import.meta.env is not populated in vite.config's Node context.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
	? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
	: (process.env.VITE_SITE_URL ?? "http://localhost:3000");

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	define: {
		"import.meta.env.VITE_SITE_URL": JSON.stringify(siteUrl),
	},
	plugins: [
		// Generate metric-matched fallback @font-face rules from the real
		// self-hosted woff2 files so the swap to the web font causes ~zero
		// layout shift.
		FontaineTransform.vite({
			fallbacks: {
				"Space Grotesk": ["Arial", "Helvetica Neue", "sans-serif"],
				"JetBrains Mono": ["Courier New", "ui-monospace", "monospace"],
			},
			resolvePath: (id) =>
				fileURLToPath(new URL(`./public${id}`, import.meta.url)),
		}),
		devtools(),
		nitro(),
		imagetools({
			defaultDirectives: (url) => {
				for (const [marker, directives] of Object.entries(IMAGE_PRESETS)) {
					if (url.searchParams.has(marker)) {
						return new URLSearchParams(directives);
					}
				}
				return new URLSearchParams();
			},
		}),
		tailwindcss(),
		tanstackStart({
			sitemap: { enabled: true, outputPath: "sitemap.xml", host: siteUrl },
			prerender: { enabled: true, crawlLinks: true, failOnError: true },
			// The crawler reaches the projects index as both /projects and
			// /projects/; keep only the canonical form in the sitemap.
			// /style is the internal style guide — it sets `noindex` in its own
			// head, so listing it here too would hand crawlers contradictory
			// signals (Search Console flags "submitted URL marked noindex").
			pages: [
				{ path: "/projects/", sitemap: { exclude: true } },
				{ path: "/style", sitemap: { exclude: true } },
			],
		}),
		viteReact(),
	],
});

export default config;
