import { Link } from "@tanstack/react-router";
import { Picture } from "#/components/picture";
import type { Project } from "#/content/projects";

export function ProjectPreview({
	project,
	description = project.tagline,
	headingAs: Heading = "h3",
}: {
	project: Project;
	description?: string;
	headingAs?: "h2" | "h3";
}) {
	return (
		<article className="project-preview">
			<header className="work-caption">
				<div>
					<Heading>{project.title}</Heading>
					<p>{description}</p>
				</div>
				<Link
					to="/projects/$projectId"
					params={{ projectId: project.projectId }}
					className="detail-link"
				>
					view project
				</Link>
			</header>
			<figure>
				<Link
					to="/projects/$projectId"
					params={{ projectId: project.projectId }}
					className="work-preview"
					aria-label={`View ${project.title} project`}
				>
					<Picture
						picture={project.cover.picture}
						alt={project.cover.alt}
						sizes="(min-width: 660px) 620px, calc(100vw - 40px)"
						loading="eager"
						fetchPriority="high"
						className="block"
						imgClassName="work-preview-image"
					/>
				</Link>
			</figure>
		</article>
	);
}
