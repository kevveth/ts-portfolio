import { Link } from "@tanstack/react-router";
import { Picture } from "#/components/picture";
import { featuredProject } from "#/content/projects";
import { SITE } from "#/content/site";

/** Static content stays readable before hydration and without external services. */
export function Home() {
	const project = featuredProject;
	return (
		<div className="site-frame personal-home">
			<h1 className="sr-only">Kenneth Rathbun — personal site</h1>
			<section id="work" aria-labelledby="work-heading">
				<h2 id="work-heading" className="index-label">
					work
				</h2>
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
				<div className="work-caption">
					<div>
						<h3>{project.title}</h3>
						<p>A website for my longtime barber.</p>
					</div>
					<Link
						to="/projects/$projectId"
						params={{ projectId: project.projectId }}
						className="detail-link"
					>
						view project
					</Link>
				</div>
				<p className="capture-note">
					Production capture ·{" "}
					<time dateTime="2026-10-26">October 26, 2026</time>
				</p>
			</section>
			<section
				id="about"
				aria-labelledby="about-heading"
				className="personal-about"
			>
				<h2 id="about-heading" className="index-label">
					about
				</h2>
				<p>{SITE.bio}</p>
				<p>
					I work primarily with TypeScript, React, and TanStack Start, including
					integrations with services like Square.
				</p>
			</section>
		</div>
	);
}
