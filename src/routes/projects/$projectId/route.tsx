import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Gallery } from "#/components/gallery";
import { Picture } from "#/components/picture";
import {
	ProjectActions,
	ProjectMeta,
	TechStack,
} from "#/components/project-patterns";
import { PageIntro, Section, SectionHeading } from "#/components/section";
import { Surface } from "#/components/surface";
import { Button } from "#/components/ui/button";
import { getProject, type ProjectHighlight } from "#/content/projects";
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
	const { cover, gallery } = project;

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
				<Surface as="figure" variant="raised" className="overflow-hidden">
					<Picture
						picture={cover.picture}
						alt={cover.alt}
						sizes="(min-width: 1024px) 1024px, 100vw"
						loading="eager"
						fetchPriority="high"
					/>
				</Surface>
			</Section>

			<Section width="reading" className="space-y-12">
				<div className="space-y-3">
					<SectionHeading kicker="overview" spacing="none" />
					<p className="leading-relaxed">{project.summary}</p>
				</div>
				<div className="space-y-3">
					<SectionHeading kicker="the problem" spacing="none" />
					<p className="leading-relaxed text-muted-foreground">
						{project.problem}
					</p>
				</div>
				{project.productionConstraint ? (
					<div className="space-y-3">
						<SectionHeading kicker="the production constraint" spacing="none" />
						<p className="leading-relaxed text-muted-foreground">
							{project.productionConstraint}
						</p>
					</div>
				) : null}
				<div className="space-y-3">
					<SectionHeading kicker="what I shipped" spacing="none" />
					<p className="leading-relaxed text-muted-foreground">
						{project.approach}
					</p>
				</div>
			</Section>

			<Section spacing="continued">
				<SectionHeading kicker="production highlights" />
				<HighlightList highlights={project.highlights} />
			</Section>

			<Section spacing="continued">
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
			</Section>

			{gallery.length > 0 ? (
				<Section spacing="continued">
					<SectionHeading kicker="production" title="Live site" />
					<Gallery items={gallery} />
				</Section>
			) : null}

			{project.customFlow ? (
				<>
					<Section width="reading" spacing="continued">
						<SectionHeading
							kicker="future path"
							title="The custom booking flow"
						/>
						<p className="leading-relaxed text-muted-foreground">
							{project.customFlow.summary}
						</p>
					</Section>
					<Section spacing="continued">
						<SectionHeading kicker="custom flow engineering" />
						<HighlightList highlights={project.customFlow.highlights} />
					</Section>
					<Section spacing="continued">
						<SectionHeading kicker="sandbox only" title="Custom flow screens" />
						<Gallery items={project.customFlow.gallery} />
					</Section>
				</>
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

function HighlightList({
	highlights,
}: {
	highlights: readonly ProjectHighlight[];
}) {
	return (
		<dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
			{highlights.map((highlight) => (
				<div key={highlight.title} className="space-y-1.5">
					<dt className="font-semibold">
						<span aria-hidden className="mr-2 font-mono text-xs text-brand">
							▸
						</span>
						{highlight.title}
					</dt>
					<dd className="text-sm leading-relaxed text-muted-foreground">
						{highlight.body}
					</dd>
				</div>
			))}
		</dl>
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
