import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Picture } from "#/components/picture";
import { ProjectMeta, TechStack } from "#/components/project-patterns";
import { Surface } from "#/components/surface";
import type { Project } from "#/content/projects";
import { getProjectThumb } from "#/lib/project-images";

type ProjectCardProps = {
	project: Project;
	imageSizes: string;
};

export function ProjectCard({ project, imageSizes }: ProjectCardProps) {
	return (
		<Surface
			variant="interactive"
			className="group relative flex h-full flex-col overflow-hidden"
		>
			<div className="aspect-[16/10] overflow-hidden border-b">
				<Picture
					picture={getProjectThumb(project.slug)}
					alt={project.thumbAlt}
					sizes={imageSizes}
					className="block h-full w-full"
					imgClassName="project-image h-full w-full object-contain object-center"
				/>
			</div>
			<header className="flex flex-col gap-2 px-6 pt-5">
				<h2 className="text-lg leading-none font-semibold">
					<Link
						to="/projects/$slug"
						params={{ slug: project.slug }}
						aria-label={`View ${project.title} case study`}
						className="transition-colors after:absolute after:inset-0 after:rounded-lg after:content-[''] hover:text-brand focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand focus-visible:after:ring-offset-2"
					>
						{project.title}
					</Link>
				</h2>
				<div className="text-sm text-muted-foreground">
					<ProjectMeta project={project} />
				</div>
			</header>
			<div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-6">
				<p className="text-sm leading-relaxed text-muted-foreground">
					{project.tagline}
				</p>
				<TechStack stack={project.stack} />
				<span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand">
					View case study
					<ArrowRight
						aria-hidden
						className="size-3.5 transition-transform group-hover:translate-x-0.5"
					/>
				</span>
			</div>
		</Surface>
	);
}
