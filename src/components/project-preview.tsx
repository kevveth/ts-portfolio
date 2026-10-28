import { Link } from "@tanstack/react-router";
import { Picture } from "#/components/picture";
import type { Project } from "#/content/projects";

export function ProjectPreview({
	project,
	headingAs: Heading = "h3",
}: {
	project: Project;
	headingAs?: "h2" | "h3";
}) {
	return (
		<article className="project-preview">
			<Heading className="sr-only">{project.title}</Heading>
			<Link
				to="/projects/$projectId"
				params={{ projectId: project.projectId }}
				className="work-preview"
				aria-label={`View ${project.title} project`}
				title={project.title}
			>
				<Picture
					picture={project.cover.picture}
					alt={project.cover.alt}
					sizes="(min-width: 660px) 620px, calc(100vw - 40px)"
					loading="eager"
					fetchPriority="high"
					className="block h-full"
					imgClassName="work-preview-image"
				/>
			</Link>
		</article>
	);
}
