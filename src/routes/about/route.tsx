import { createFileRoute } from "@tanstack/react-router";
import { SITE, SITE_URL } from "#/content/site";

const TITLE = `About | ${SITE.name}`;

export const Route = createFileRoute("/about")({
	head: () => ({
		meta: [
			{ title: TITLE },
			{ name: "description", content: SITE.bio },
			{ property: "og:title", content: TITLE },
			{ property: "og:description", content: SITE.bio },
			{ property: "og:url", content: `${SITE_URL}/about` },
			{ name: "twitter:title", content: TITLE },
			{ name: "twitter:description", content: SITE.bio },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
	}),
	component: About,
});

function About() {
	return (
		<article className="site-frame about-page">
			<h1 className="index-label">About</h1>
			<p>{SITE.bio}</p>
			<p>
				I work primarily with TypeScript, React, and TanStack Start, including
				integrations with services like Square.
			</p>
		</article>
	);
}
