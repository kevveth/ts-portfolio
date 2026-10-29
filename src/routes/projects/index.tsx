import { createFileRoute } from "@tanstack/react-router";
import { ProjectPreview } from "#/components/project-preview";
import { projects } from "#/content/projects";
import { SITE, SITE_URL } from "#/content/site";

const TITLE = `Projects | ${SITE.name}`;
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
	return (
		<div className="site-frame project-index">
			<header className="project-index-intro">
				<h1 className="page-title">Selected work</h1>
			</header>
			<div className="project-gallery">
				{projects.map((project) => (
					<ProjectPreview
						key={project.projectId}
						project={project}
						headingAs="h2"
					/>
				))}
			</div>
		</div>
	);
}
