import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { LiveSiteButton } from "#/components/live-site-button";
import { Picture } from "#/components/picture";
import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { StatusBadge } from "#/components/status-badge";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { getFeaturedProject } from "#/content/projects";
import { getProjectImage } from "#/lib/project-images";

/** Home's flagship-project spotlight — the site's de-facto hero image. */
export function FeaturedProject() {
	const project = getFeaturedProject();
	const cover = getProjectImage(project.gallery[0].src);

	return (
		<Section id="featured">
			<SectionHeading kicker="featured work" title={project.title} />
			<Reveal>
				<div className="grid items-start gap-8 lg:grid-cols-[3fr_2fr]">
					<Link
						to="/projects/$slug"
						params={{ slug: project.slug }}
						aria-label={`${project.title} case study`}
						className="group block overflow-hidden rounded-lg border bg-card shadow-sm"
					>
						<Picture
							picture={cover}
							alt={project.gallery[0].alt}
							sizes="(min-width: 1024px) 60vw, 100vw"
							loading="eager"
							fetchPriority="high"
							imgClassName="transition-transform duration-500 group-hover:scale-[1.015]"
						/>
					</Link>
					<div className="space-y-5">
						<StatusBadge status={project.status} />
						<p className="text-lg leading-relaxed text-balance">
							{project.tagline}
						</p>
						<p className="leading-relaxed text-muted-foreground">
							{project.summary}
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
						<div className="flex flex-wrap gap-3 pt-1">
							<Button asChild>
								<Link to="/projects/$slug" params={{ slug: project.slug }}>
									Read the case study
									<ArrowRight aria-hidden />
								</Link>
							</Button>
							{project.liveUrl ? (
								<LiveSiteButton href={project.liveUrl} variant="outline" />
							) : null}
						</div>
					</div>
				</div>
			</Reveal>
		</Section>
	);
}
