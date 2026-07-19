import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "ui-library";
import { ProjectCard } from "#/components/project-card";
import { Reveal } from "#/components/reveal";
import { PageIntro, Section, SectionHeading } from "#/components/section";
import { getAllProjects } from "#/content/projects";
import { SITE, SITE_URL } from "#/content/site";
import { cn } from "#/lib/utils";

const TITLE = `Projects — ${SITE.name}`;
const DESCRIPTION =
	"Selected projects and case studies: production web apps designed and built end to end.";
const VISIBLE_DESCRIPTION =
	"A closer look at products I’ve designed, built, and shipped.";
const SINGLE_PROJECT_IMAGE_SIZES = "(min-width: 768px) 768px, 100vw";
const GRID_IMAGE_SIZES = "(min-width: 768px) 50vw, 100vw";

export const Route = createFileRoute("/projects/")({
	head: () => ({
		meta: [
			{ title: TITLE },
			{ name: "description", content: DESCRIPTION },
			{ property: "og:title", content: TITLE },
			{ property: "og:description", content: DESCRIPTION },
			{ property: "og:url", content: `${SITE_URL}/projects` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/projects` }],
	}),
	component: ProjectsIndex,
});

function ProjectsIndex() {
	const projects = getAllProjects();
	const isSingleProject = projects.length === 1;

	return (
		<>
			<Section>
				<PageIntro
					kicker="projects"
					title="Selected work"
					description={VISIBLE_DESCRIPTION}
					className="mb-10"
				/>
				<Reveal>
					<div
						className={cn(
							"grid gap-6",
							isSingleProject ? "max-w-3xl" : "md:grid-cols-2",
						)}
					>
						{projects.map((project) => (
							<ProjectCard
								key={project.slug}
								project={project}
								imageSizes={
									isSingleProject
										? SINGLE_PROJECT_IMAGE_SIZES
										: GRID_IMAGE_SIZES
								}
							/>
						))}
					</div>
				</Reveal>
			</Section>
			<Section spacing="compact" divided>
				<Reveal>
					<SectionHeading
						kicker="under the hood"
						title="This site is a build too"
					/>
					<p className="max-w-3xl leading-relaxed text-muted-foreground">
						This portfolio is built the same way I build client work: TanStack
						Start with SSR, a hand-rolled canvas hero that respects reduced
						motion and transparency, a contribution graph fed by GitHub&apos;s
						GraphQL API, and Vitest, Playwright, and axe-core keeping it honest.
					</p>
					<Button
						asChild
						size="lg"
						variant="link"
						className="portfolio-link mt-5"
					>
						<a
							href={SITE.siteRepo}
							target="_blank"
							rel="noreferrer"
							aria-label="View the source (opens in a new tab)"
						>
							View the source
							<ArrowUpRight aria-hidden />
						</a>
					</Button>
				</Reveal>
			</Section>
		</>
	);
}
