import { ProjectPreview } from "#/components/project-preview";
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
				<ProjectPreview
					project={project}
					description="A website for my longtime barber."
				>
					Production capture ·{" "}
					<time dateTime="2026-10-26">October 26, 2026</time>
				</ProjectPreview>
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
