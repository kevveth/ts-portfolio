import { Link } from "@tanstack/react-router";
import { Picture } from "#/components/picture";
import {
	ProjectActions,
	ProjectMeta,
	TechStack,
} from "#/components/project-patterns";
import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { Surface } from "#/components/surface";
import { featuredProject } from "#/content/projects";

/** Home's flagship-project spotlight — the site's de-facto hero image. */
export function FeaturedProject() {
	const project = featuredProject;
	const { cover } = project;

	return (
		<Section id="featured">
			<SectionHeading kicker="featured work" title={project.title} />
			<Reveal>
				<div className="grid items-start gap-8 lg:grid-cols-[3fr_2fr]">
					<Link
						to="/projects/$projectId"
						params={{ projectId: project.projectId }}
						aria-label={`${project.title} case study`}
						className="group block rounded-lg"
					>
						<Surface
							as="figure"
							variant="raised"
							className="featured-visual overflow-hidden"
						>
							<Picture
								picture={cover.picture}
								alt={cover.alt}
								sizes="(min-width: 1024px) 60vw, 100vw"
								loading="eager"
								fetchPriority="high"
								imgClassName="project-image"
							/>
						</Surface>
					</Link>
					<div className="featured-copy space-y-5">
						<ProjectMeta project={project} />
						<p className="text-lg leading-relaxed text-balance">
							{project.tagline}
						</p>
						<p className="leading-relaxed text-muted-foreground">
							{project.summary}
						</p>
						<TechStack stack={project.stack} />
						<ProjectActions project={project} caseStudy className="pt-1" />
					</div>
				</div>
			</Reveal>
		</Section>
	);
}
