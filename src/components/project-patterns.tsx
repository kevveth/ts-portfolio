import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Mail } from "lucide-react";
import { StatusBadge } from "#/components/status-badge";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import type { Project } from "#/content/projects";
import { SITE } from "#/content/site";
import { cn } from "#/lib/utils";

/**
 * Role / year / status as a description list: each value has a real term,
 * kept sr-only so the rendered line is unchanged. The sr-only <dt>s are
 * absolutely positioned, so they drop out of the flex flow and never earn a
 * gap; the year's negative margin cancels the one gap that would otherwise
 * sit where the "·" separator goes.
 */
export function ProjectMeta({ project }: { project: Project }) {
	return (
		<dl className="flex flex-wrap items-center gap-x-3 gap-y-2">
			<dt className="sr-only">Role</dt>
			<dd className="metadata">{project.role}</dd>
			<dt className="sr-only">Year</dt>
			<dd className="metadata -ml-3 before:px-[0.6em] before:content-['·']">
				<time dateTime={project.year}>{project.year}</time>
			</dd>
			<dt className="sr-only">Status</dt>
			{/* flex, not the default block: a block <dd> puts the inline-flex
			    badge on a text baseline and inherits the descender space. */}
			<dd className="flex">
				<StatusBadge status={project.status} />
			</dd>
		</dl>
	);
}

export function TechStack({
	stack,
	className,
}: {
	stack: readonly string[];
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
	className?: string;
};

export function ProjectActions({
	project,
	caseStudy = false,
	contact = false,
	className,
}: ProjectActionsProps) {
	return (
		<div
			className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}
		>
			{caseStudy ? (
				<Button asChild size="lg">
					<Link
						to="/projects/$projectId"
						params={{ projectId: project.projectId }}
					>
						Read the case study
						<ArrowRight aria-hidden />
					</Link>
				</Button>
			) : null}
			{project.liveUrl ? (
				<Button asChild variant={caseStudy ? "brand-link" : "default"}>
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
				<Button asChild variant="brand-link">
					<a href={`mailto:${SITE.email}`}>
						<Mail aria-hidden />
						Get in touch
					</a>
				</Button>
			) : null}
		</div>
	);
}
