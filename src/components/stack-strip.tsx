import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { Surface } from "#/components/surface";
import { SITE } from "#/content/site";

export function StackStrip() {
	return (
		<Section spacing="compact">
			<SectionHeading kicker="stack" className="mb-5" />
			<Reveal>
				<Surface className="accent-surface space-y-4 p-4 sm:p-5">
					{Object.entries(SITE.skills).map(([group, skills]) => (
						<div key={group} className="flex flex-wrap items-center gap-2">
							<span className="kicker w-14 shrink-0">{group}</span>
							<ul className="flex flex-wrap gap-2">
								{skills.map((skill) => (
									<li
										key={skill}
										className="rounded-md border bg-background px-2.5 py-1.5 font-mono text-xs text-muted-foreground"
									>
										{skill}
									</li>
								))}
							</ul>
						</div>
					))}
				</Surface>
			</Reveal>
		</Section>
	);
}
