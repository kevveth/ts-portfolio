import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import desktopCapture from "#/assets/chavos-parlor/production-desktop.png?url";
import phoneCapture from "#/assets/chavos-parlor/production-mobile.png?url";
import { Picture } from "#/components/picture";
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
				{ property: "og:image:alt", content: loaderData.socialImageAlt },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: loaderData.tagline },
				{
					name: "twitter:image",
					content: `${SITE_URL}${loaderData.socialImage}`,
				},
				{ name: "twitter:image:alt", content: loaderData.socialImageAlt },
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
			<Link to="/" hash="work" className="detail-link">
				back to work
			</Link>
			<header>
				<h1 className="page-title">{project.title}</h1>
				<p className="story-lede">{project.tagline}</p>
				{project.liveUrl ? (
					<div className="story-actions">
						<a
							href={project.liveUrl}
							target="_blank"
							rel="noreferrer"
							className="detail-link"
							aria-label={`Visit ${project.title} live site (opens in a new tab)`}
						>
							visit live site
						</a>
					</div>
				) : null}
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
					Live website · October 26, 2026 ·{" "}
					<a href={desktopCapture} className="detail-link">
						full desktop image
					</a>{" "}
					/{" "}
					<a href={phoneCapture} className="detail-link">
						phone image
					</a>
				</figcaption>
			</figure>
			<section aria-labelledby="story-overview">
				<h2 id="story-overview">Overview</h2>
				<p>{project.summary}</p>
			</section>
			<section aria-labelledby="story-implementation">
				<h2 id="story-implementation">Design and implementation</h2>
				<p>{project.implementation}</p>
			</section>
			<section aria-labelledby="story-workflow">
				<h2 id="story-workflow">Square integration</h2>
				<p>{project.approach}</p>
			</section>
			{project.highlights.map((highlight) => (
				<section key={highlight.title}>
					<h2>{highlight.title}</h2>
					<p>{highlight.body}</p>
				</section>
			))}
		</article>
	);
}

function ProjectNotFound() {
	return (
		<div className="site-frame">
			<p className="index-label">404 — not found</p>
			<h1 className="page-title">No project with that name.</h1>
			<p className="story-lede">
				It may have been renamed, or the link is stale.
			</p>
			<Link to="/" className="detail-link story-actions">
				back home
			</Link>
		</div>
	);
}
