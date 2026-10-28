import { ProjectPreview } from "#/components/project-preview";
import { featuredProject } from "#/content/projects";

/** Static content stays readable before hydration and without external services. */
export function Home() {
	const project = featuredProject;
	return (
		<div className="site-frame personal-home">
			<h1 className="sr-only">Kenneth Rathbun — personal site</h1>
			<section id="work" aria-labelledby="work-heading">
				<h2 id="work-heading" className="sr-only">
					work
				</h2>
				<ProjectPreview
					project={project}
					description="A website for my longtime barber."
				/>
			</section>
		</div>
	);
}
