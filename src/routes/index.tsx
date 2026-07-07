import { createFileRoute } from "@tanstack/react-router";
import { ContactCta } from "#/components/contact-cta";
import { FeaturedProject } from "#/components/featured-project";
import { Hero } from "#/components/hero";
import { StackStrip } from "#/components/stack-strip";
import { SITE, SITE_URL } from "#/content/site";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: `${SITE.name} — ${SITE.role}` },
			{ name: "description", content: SITE.metaDescription },
			{ property: "og:title", content: `${SITE.name} — ${SITE.role}` },
			{ property: "og:description", content: SITE.metaDescription },
			{ property: "og:url", content: `${SITE_URL}/` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/` }],
	}),
	component: Home,
});

function Home() {
	return (
		<>
			<Hero />
			<FeaturedProject />
			<StackStrip />
			<ContactCta />
		</>
	);
}
