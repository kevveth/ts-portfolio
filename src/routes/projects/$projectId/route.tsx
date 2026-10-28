import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ProjectStoryGallery } from "#/components/project-story-gallery";
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
		<article className="project-news">
			<ProjectStoryGallery
				key={project.projectId}
				slides={[project.cover, ...project.gallery]}
				title={project.title}
			/>
			<div className="news-copy">
				<header>
					<p className="news-date">
						<time dateTime={project.publication.dateTime}>
							{project.publication.label}
						</time>
					</p>
					<h1 className="news-title">{project.title}</h1>
				</header>
				<div className="news-body">
					{project.story.map((paragraph) => (
						<p key={paragraph}>{paragraph}</p>
					))}
				</div>
				<div className="news-actions">
					{project.liveUrl ? (
						<a
							href={project.liveUrl}
							target="_blank"
							rel="noreferrer"
							className="detail-link"
							aria-label={`Visit ${project.title} live site (opens in a new tab)`}
						>
							<span className="link-label">visit live site</span>
						</a>
					) : null}
				</div>
			</div>
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
				<span className="link-label">back home</span>
			</Link>
		</div>
	);
}
