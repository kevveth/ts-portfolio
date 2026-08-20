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
import { featuredCredentials } from "#/content/credentials";
import { SITE_URL } from "#/content/site";
import { getContributions } from "#/lib/github";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [{ property: "og:url", content: `${SITE_URL}/` }],
		links: [{ rel: "canonical", href: `${SITE_URL}/` }],
	}),
	// Only the GitHub contributions need a loader; the featured Credentials are
	// static content the component imports directly.
	loader: () => getContributions(),
	component: Home,
});

function Home() {
	const contributions = Route.useLoaderData();

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
