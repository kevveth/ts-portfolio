import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { Surface } from "#/components/surface";
import { SITE } from "#/content/site";

export function StackStrip() {
	return (
		<Section spacing="compact">
			<SectionHeading kicker="stack" className="mb-5" />
			<Reveal>
				<Surface className="p-4 sm:p-5">
					<ul className="flex flex-wrap gap-2">
						{SITE.skills.map((skill) => (
							<li
								key={skill}
								className="rounded-md border bg-background px-2.5 py-1.5 font-mono text-xs text-muted-foreground"
							>
								{skill}
							</li>
						))}
					</ul>
				</Surface>
			</Reveal>
		</Section>
	);
}
