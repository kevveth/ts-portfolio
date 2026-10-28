import { ProjectPreview } from "#/components/project-preview";
import { featuredProject } from "#/content/projects";

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
		</div>
	);
}
