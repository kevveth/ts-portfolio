import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "ui-library";
import { Gallery } from "#/components/gallery";
import { Picture } from "#/components/picture";
import {
	ProjectActions,
	ProjectMeta,
	TechStack,
} from "#/components/project-patterns";
import { PageIntro, Section, SectionHeading } from "#/components/section";
import { Surface } from "#/components/surface";
import { getProject } from "#/content/projects";
import { SITE, SITE_URL } from "#/content/site";
import { getProjectImage } from "#/lib/project-images";

export const Route = createFileRoute("/projects/$slug")({
	loader: ({ params }) => {
		const project = getProject(params.slug);
		if (!project) throw notFound();
		return project;
	},
	head: ({ loaderData }) => {
		if (!loaderData) return {};
		const title = `${loaderData.title} — ${SITE.name}`;
		const url = `${SITE_URL}/projects/${loaderData.slug}`;
		return {
			meta: [
				{ title },
				{ name: "description", content: loaderData.tagline },
				{ property: "og:title", content: title },
				{ property: "og:description", content: loaderData.tagline },
				{ property: "og:url", content: url },
			],
			links: [{ rel: "canonical", href: url }],
		};
	},
	notFoundComponent: ProjectNotFound,
	component: ProjectDetail,
});

function ProjectDetail() {
	const project = Route.useLoaderData();
	const [cover, ...shots] = project.gallery;

	return (
		<article>
			<Section className="pb-8 sm:pb-10">
				<PageIntro
					kicker="case study"
					title={project.title}
					description={project.tagline}
				>
					<ProjectMeta project={project} />
					<TechStack stack={project.stack} className="pt-1" />
					<ProjectActions project={project} className="pt-2" />
				</PageIntro>
			</Section>

			<Section spacing="flush">
				<Surface variant="raised" className="overflow-hidden">
					<Picture
						picture={getProjectImage(cover.src)}
						alt={cover.alt}
						sizes="(min-width: 1024px) 1024px, 100vw"
						loading="eager"
						fetchPriority="high"
					/>
				</Surface>
			</Section>

			<Section width="reading" className="space-y-12">
				<div className="space-y-3">
					<SectionHeading kicker="overview" className="mb-0" />
					<p className="leading-relaxed">{project.summary}</p>
				</div>
				<div className="space-y-3">
					<SectionHeading kicker="the problem" className="mb-0" />
					<p className="leading-relaxed text-muted-foreground">
						{project.problem}
					</p>
				</div>
				<div className="space-y-3">
					<SectionHeading kicker="the approach" className="mb-0" />
					<p className="leading-relaxed text-muted-foreground">
						{project.approach}
					</p>
				</div>
			</Section>

			<Section className="pt-0">
				<SectionHeading kicker="technical highlights" />
				<dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
					{project.highlights.map((highlight, index) => (
						<div key={highlight.title} className="space-y-1.5">
							<dt className="font-semibold">
								<span aria-hidden className="mr-2 font-mono text-xs text-brand">
									{String(index + 1).padStart(2, "0")}
								</span>
								{highlight.title}
							</dt>
							<dd className="text-sm leading-relaxed text-muted-foreground">
								{highlight.body}
							</dd>
						</div>
					))}
				</dl>
			</Section>

			<Section className="pt-0">
				<SectionHeading kicker="outcomes" />
				<ul className="max-w-3xl space-y-2.5">
					{project.outcomes.map((outcome) => (
						<li key={outcome} className="flex gap-3 leading-relaxed">
							<span aria-hidden className="font-mono text-brand">
								▸
							</span>
							{outcome}
						</li>
					))}
				</ul>
				{project.testimonial ? (
					<blockquote className="mt-10 max-w-2xl border-l-2 border-brand pl-5">
						<p className="text-lg leading-relaxed italic">
							"{project.testimonial.quote}"
						</p>
						<footer className="mt-3 font-mono text-xs text-muted-foreground">
							— {project.testimonial.author}
						</footer>
					</blockquote>
				) : null}
			</Section>

			{shots.length > 0 ? (
				<Section className="pt-0">
					<SectionHeading kicker="screens" />
					<Gallery items={shots} />
				</Section>
			) : null}

			<Section divided>
				<div className="flex flex-wrap items-center gap-3">
					<ProjectActions project={project} contact />
					<Link
						to="/projects"
						className="px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						← All projects
					</Link>
				</div>
			</Section>
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
				<Link to="/projects">Browse all projects</Link>
			</Button>
		</Section>
	);
}
