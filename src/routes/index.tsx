import { createFileRoute } from "@tanstack/react-router";
import { ContactCta } from "#/components/contact-cta";
import {
	ContributionGraph,
	ContributionGraphError,
} from "#/components/contribution-graph";
import { FeaturedProject } from "#/components/featured-project";
import { Hero } from "#/components/hero";
import { StackStrip } from "#/components/stack-strip";
import { SITE, SITE_URL } from "#/content/site";
import { fetchContributions } from "#/lib/github";

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
		const result = await fetchContributions();
		return result;
	},
	component: Home,
});

function Home() {
	const result = Route.useLoaderData();

	return (
		<>
			<Hero />
			<FeaturedProject />
			{result.ok ? (
				<ContributionGraph data={result.data} />
			) : (
				<ContributionGraphError message={result.error} />
			)}
			<StackStrip />
			<ContactCta />
		</>
	);
}
