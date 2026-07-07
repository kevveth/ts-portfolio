import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { SITE } from "#/content/site";

export function StackStrip() {
	return (
		<Section className="py-10 sm:py-12">
			<SectionHeading kicker="stack" className="mb-5" />
			<Reveal>
				<ul className="flex flex-wrap gap-2">
					{SITE.skills.map((skill) => (
						<li
							key={skill}
							className="rounded-md border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground"
						>
							{skill}
						</li>
					))}
				</ul>
			</Reveal>
		</Section>
	);
}
