import { createFileRoute } from "@tanstack/react-router";
import { SITE, SITE_URL } from "#/content/site";
import { Home } from "./-home";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: SITE.name },
			{ name: "description", content: SITE.metaDescription },
			{ property: "og:title", content: SITE.name },
			{ property: "og:description", content: SITE.metaDescription },
			{ property: "og:url", content: `${SITE_URL}/` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/` }],
	}),
	component: Home,
});
