import { createFileRoute } from "@tanstack/react-router";
import { ContactCta } from "#/components/contact-cta";
import {
	ContributionGraph,
	ContributionGraphError,
} from "#/components/contribution-graph";
import { FeaturedCredentials } from "#/components/credentials";
import { FeaturedProject } from "#/components/featured-project";
import { Hero } from "#/components/hero";
import { StackStrip } from "#/components/stack-strip";
import { type DateOnly, getFeaturedCredentials } from "#/content/credentials";
import { SITE, SITE_URL } from "#/content/site";
import { getContributions } from "#/lib/github";

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
	loader: async () => {
		const contributions = await getContributions();
		const asOf = new Date().toISOString().slice(0, 10) as DateOnly;
		return {
			contributions,
			featuredCredentials: getFeaturedCredentials(asOf),
		};
	},
	component: Home,
});

function Home() {
	const { contributions, featuredCredentials } = Route.useLoaderData();

	return (
		<>
			<Hero />
			<FeaturedProject />
			{contributions.ok ? (
				<ContributionGraph data={contributions.data} />
			) : (
				<ContributionGraphError />
			)}
			<StackStrip />
			<FeaturedCredentials credentials={featuredCredentials} />
			<ContactCta />
		</>
	);
}
