import { createFileRoute } from "@tanstack/react-router";
// Bare import: pulls in @tanstack/react-start's type augmentation of
// `@tanstack/router-core` so `createFileRoute(...)({ server: { handlers } })`
// below type-checks (nothing here needs its runtime exports).
import "@tanstack/react-start";
import { SITE_URL } from "#/content/site";

export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: () =>
				new Response(
					`User-agent: *\nDisallow:\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
					{ headers: { "content-type": "text/plain" } },
				),
		},
	},
});
