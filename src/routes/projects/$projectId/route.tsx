import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import desktopCapture from "#/assets/chavos-parlor/production-desktop.png?url";
import phoneCapture from "#/assets/chavos-parlor/production-mobile.png?url";
import { Picture } from "#/components/picture";
import { ProjectActions } from "#/components/project-patterns";
import { PageIntro, Section } from "#/components/section";
import { Button } from "#/components/ui/button";
import { getProject } from "#/content/projects";
import { SITE, SITE_URL } from "#/content/site";

export const Route = createFileRoute("/projects/$projectId")({
	loader: ({ params }) => {
		const project = getProject(params.projectId);
		if (!project) throw notFound();
		return project;
	},
	head: ({ loaderData }) => {
		if (!loaderData) return {};
		const title = `${loaderData.title} | ${SITE.name}`;
		const url = `${SITE_URL}/projects/${loaderData.projectId}`;
		return {
			meta: [
				{ title },
				{ name: "description", content: loaderData.tagline },
				{ property: "og:title", content: title },
				{ property: "og:description", content: loaderData.tagline },
				{ property: "og:url", content: url },
				{
					property: "og:image",
					content: `${SITE_URL}${loaderData.socialImage}`,
				},
				{ property: "og:image:type", content: "image/jpeg" },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{ property: "og:image:alt", content: loaderData.cover.alt },
			],
			links: [{ rel: "canonical", href: url }],
		};
	},
	notFoundComponent: ProjectNotFound,
	component: ProjectDetail,
});

function ProjectDetail() {
	const project = Route.useLoaderData();
	return (
		<article className="site-frame project-story">
			<Link to="/" hash="work" className="text-link">
				← work
			</Link>
			<header>
				<h1>{project.title}</h1>
				<p className="story-lede">{project.tagline}</p>
				<ProjectActions project={project} />
			</header>
			<figure>
				<a
					href={desktopCapture}
					aria-label="Open full desktop production capture"
					className="work-preview"
				>
					<Picture
						picture={project.cover.picture}
						alt={project.cover.alt}
						sizes="(min-width: 660px) 620px, calc(100vw - 40px)"
						loading="eager"
						fetchPriority="high"
						imgClassName="work-preview-image"
					/>
				</a>
				<figcaption className="capture-note">
					Real Production capture · October 26, 2026 ·{" "}
					<a href={desktopCapture} className="text-link">
						full desktop image ↗
					</a>{" "}
					/{" "}
					<a href={phoneCapture} className="text-link">
						phone image ↗
					</a>
				</figcaption>
			</figure>
			<section aria-labelledby="story-overview">
				<h2 id="story-overview">The project</h2>
				<p>{project.summary}</p>
				<p>{project.problem}</p>
			</section>
			<section aria-labelledby="story-workflow">
				<h2 id="story-workflow">Keep the barber’s workflow familiar</h2>
				<p>{project.approach}</p>
			</section>
			{project.highlights.map((highlight) => (
				<section key={highlight.title}>
					<h2>{highlight.title}</h2>
					<p>{highlight.body}</p>
				</section>
			))}
			<section aria-labelledby="story-delivery">
				<h2 id="story-delivery">Delivery</h2>
				{project.outcomes.map((outcome) => (
					<p key={outcome}>{outcome}</p>
				))}
			</section>
		</article>
	);
}

function ProjectNotFound() {
	return (
		<Section spacing="default" width="reading">
			<PageIntro
				kicker="404 — not found"
				title="No project with that name."
				description="It may have been renamed, or the link is stale."
			/>
			<Button asChild variant="outline" className="mt-6">
				<Link to="/">Back home</Link>
			</Button>
		</Section>
	);
}
