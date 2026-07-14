import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Mail } from "lucide-react";
import { Button } from "ui-library";
import { StatusBadge } from "#/components/status-badge";
import { Badge } from "#/components/ui/badge";
import type { Project } from "#/content/projects";
import { SITE } from "#/content/site";
import { cn } from "#/lib/utils";

export function ProjectMeta({ project }: { project: Project }) {
	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
			<p className="metadata">
				{project.role} · {project.year}
			</p>
			<StatusBadge status={project.status} />
		</div>
	);
}

export function TechStack({
	stack,
	className,
}: {
	stack: string[];
	className?: string;
}) {
	return (
		<ul
			className={cn("flex flex-wrap gap-1.5", className)}
			aria-label="Technology stack"
		>
			{stack.map((tech) => (
				<li key={tech}>
					<Badge variant="outline" className="font-mono text-xs font-normal">
						{tech}
					</Badge>
				</li>
			))}
		</ul>
	);
}

type ProjectActionsProps = {
	project: Project;
	caseStudy?: boolean;
	contact?: boolean;
	compact?: boolean;
	className?: string;
};

export function ProjectActions({
	project,
	caseStudy = false,
	contact = false,
	compact = false,
	className,
}: ProjectActionsProps) {
	if (compact) {
		return (
			<div className={cn("flex flex-wrap items-center gap-4", className)}>
				{caseStudy ? (
					<Link
						to="/projects/$slug"
						params={{ slug: project.slug }}
						className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand/80"
					>
						Case study
						<ArrowRight aria-hidden className="size-3.5" />
					</Link>
				) : null}
				{project.liveUrl ? (
					<a
						href={project.liveUrl}
						target="_blank"
						rel="noreferrer"
						aria-label={`Visit ${project.title} live site (opens in a new tab)`}
						className="relative z-10 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Live site
						<ExternalLink aria-hidden className="size-3.5" />
					</a>
				) : null}
			</div>
		);
	}

	return (
		<div
			className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}
		>
			{caseStudy ? (
				<Button asChild size="lg" className="portfolio-primary">
					<Link to="/projects/$slug" params={{ slug: project.slug }}>
						Read the case study
						<ArrowRight aria-hidden />
					</Link>
				</Button>
			) : null}
			{project.liveUrl ? (
				<Button
					asChild
					variant={caseStudy ? "link" : "default"}
					className={caseStudy ? "portfolio-link" : "portfolio-primary"}
				>
					<a
						href={project.liveUrl}
						target="_blank"
						rel="noreferrer"
						aria-label={`Visit ${project.title} live site (opens in a new tab)`}
					>
						Visit live site
						<ExternalLink aria-hidden />
					</a>
				</Button>
			) : null}
			{contact ? (
				<Button asChild variant="link" className="portfolio-link">
					<a href={`mailto:${SITE.email}`}>
						<Mail aria-hidden />
						Get in touch
					</a>
				</Button>
			) : null}
		</div>
	);
}
