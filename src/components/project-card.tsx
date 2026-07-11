import { Link } from "@tanstack/react-router";
import { Picture } from "#/components/picture";
import {
	ProjectActions,
	ProjectMeta,
	TechStack,
} from "#/components/project-patterns";
import { Surface } from "#/components/surface";
import {
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import type { Project } from "#/content/projects";
import { getProjectThumb } from "#/lib/project-images";

export function ProjectCard({ project }: { project: Project }) {
	return (
		<Surface
			variant="interactive"
			className="group flex h-full flex-col overflow-hidden"
		>
			<div className="overflow-hidden border-b">
				<Picture
					picture={getProjectThumb(project.slug)}
					alt={project.gallery[0].alt}
					sizes="(min-width: 768px) 50vw, 100vw"
					imgClassName="project-image"
				/>
			</div>
			<CardHeader>
				<CardTitle className="text-lg">
					<Link
						to="/projects/$slug"
						params={{ slug: project.slug }}
						className="hover:text-brand transition-colors"
					>
						{project.title}
					</Link>
				</CardTitle>
				<CardDescription>
					<ProjectMeta project={project} />
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm leading-relaxed text-muted-foreground">
					{project.tagline}
				</p>
				<TechStack stack={project.stack} />
			</CardContent>
			<CardFooter className="mt-auto">
				<ProjectActions project={project} compact />
			</CardFooter>
		</Surface>
	);
}
