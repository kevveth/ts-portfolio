import { ProjectPreview } from "#/components/project-preview";
import { projects } from "#/content/projects";

/** Static content stays readable before hydration and without external services. */
export function Home() {
	return (
		<div className="site-frame personal-home">
			<h1 className="sr-only">Kenneth Rathbun — personal site</h1>
			<section id="work" aria-labelledby="work-heading">
				<h2 id="work-heading" className="sr-only">
					work
				</h2>
				<div className="project-gallery">
					{projects.map((project) => (
						<ProjectPreview key={project.projectId} project={project} />
					))}
				</div>
			</section>
		</div>
	);
}
