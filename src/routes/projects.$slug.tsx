import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Gallery } from "#/components/gallery";
import { LiveSiteButton } from "#/components/live-site-button";
import { Picture } from "#/components/picture";
import { Section, SectionHeading } from "#/components/section";
import { StatusBadge } from "#/components/status-badge";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
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
				<p className="kicker mb-5">
					<span aria-hidden className="text-brand">
						{"// "}
					</span>
					case study
				</p>
				<div className="max-w-3xl space-y-4">
					<h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
						{project.title}
					</h1>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
						<p className="font-mono text-sm text-muted-foreground">
							{project.role} · {project.year}
						</p>
						<StatusBadge status={project.status} />
					</div>
					<p className="text-lg leading-relaxed text-balance sm:text-xl">
						{project.tagline}
					</p>
					<div className="flex flex-wrap gap-1.5 pt-1">
						{project.stack.map((tech) => (
							<Badge
								key={tech}
								variant="outline"
								className="font-mono text-xs font-normal"
							>
								{tech}
							</Badge>
						))}
					</div>
					{project.liveUrl ? (
						<div className="pt-2">
							<LiveSiteButton href={project.liveUrl} />
						</div>
					) : null}
				</div>
			</Section>

			<Section className="py-0">
				<div className="overflow-hidden rounded-lg border bg-card shadow-sm">
					<Picture
						picture={getProjectImage(cover.src)}
						alt={cover.alt}
						sizes="(min-width: 1024px) 1024px, 100vw"
						loading="eager"
						fetchPriority="high"
					/>
				</div>
			</Section>

			<Section className="space-y-12">
				<div className="max-w-3xl space-y-3">
					<SectionHeading kicker="overview" className="mb-0" />
					<p className="leading-relaxed">{project.summary}</p>
				</div>
				<div className="max-w-3xl space-y-3">
					<SectionHeading kicker="the problem" className="mb-0" />
					<p className="leading-relaxed text-muted-foreground">
						{project.problem}
					</p>
				</div>
				<div className="max-w-3xl space-y-3">
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

			<Section className="border-t">
				<div className="flex flex-wrap items-center gap-3">
					{project.liveUrl ? <LiveSiteButton href={project.liveUrl} /> : null}
					<Button asChild variant="outline">
						<a href={`mailto:${SITE.email}`}>
							<Mail aria-hidden />
							Get in touch
						</a>
					</Button>
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
		<Section className="py-24">
			<p className="kicker mb-4">404 — not found</p>
			<h1 className="text-3xl font-semibold tracking-tight">
				No project with that name.
			</h1>
			<p className="mt-3 text-muted-foreground">
				It may have been renamed, or the link is stale.
			</p>
			<Button asChild variant="outline" className="mt-6">
				<Link to="/projects">Browse all projects</Link>
			</Button>
		</Section>
	);
}
