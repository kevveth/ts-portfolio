import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Picture } from "#/components/picture";
import { StatusBadge } from "#/components/status-badge";
import { Badge } from "#/components/ui/badge";
import {
	Card,
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
		<Card className="group overflow-hidden pt-0">
			<Link
				to="/projects/$slug"
				params={{ slug: project.slug }}
				aria-label={`${project.title} case study`}
				className="block overflow-hidden border-b"
			>
				<Picture
					picture={getProjectThumb(project.slug)}
					alt={project.gallery[0].alt}
					sizes="(min-width: 768px) 50vw, 100vw"
					imgClassName="transition-transform duration-500 group-hover:scale-[1.02]"
				/>
			</Link>
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
				<CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs">
					<span>
						{project.role} · {project.year}
					</span>
					<StatusBadge status={project.status} />
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm leading-relaxed text-muted-foreground">
					{project.tagline}
				</p>
				<div className="flex flex-wrap gap-1.5">
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
			</CardContent>
			<CardFooter className="gap-4">
				<Link
					to="/projects/$slug"
					params={{ slug: project.slug }}
					className="inline-flex items-center gap-1 text-sm font-medium text-brand"
				>
					Case study
					<ArrowRight aria-hidden className="size-3.5" />
				</Link>
				{project.liveUrl ? (
					<a
						href={project.liveUrl}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Live site
						<ExternalLink aria-hidden className="size-3.5" />
					</a>
				) : null}
			</CardFooter>
		</Card>
	);
}
