import { createFileRoute } from "@tanstack/react-router";
import { ProjectCard } from "#/components/project-card";
import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { getAllProjects } from "#/content/projects";
import { SITE, SITE_URL } from "#/content/site";

const TITLE = `Projects — ${SITE.name}`;
const DESCRIPTION =
	"Selected projects and case studies: production web apps designed and built end to end.";

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

	return (
		<Section>
			<SectionHeading kicker="projects" title="Selected work" as="h1" />
			<Reveal>
				<div className="grid gap-6 md:grid-cols-2">
					{projects.map((project) => (
						<ProjectCard key={project.slug} project={project} />
					))}
				</div>
			</Reveal>
		</Section>
	);
}
