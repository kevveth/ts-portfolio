import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { Surface } from "#/components/surface";
import { Badge } from "#/components/ui/badge";

const SKILLS = {
	build: [
		"TypeScript",
		"React 19",
		"TanStack Start",
		"Node.js",
		"Tailwind CSS",
		"Square SDK",
		"Zod",
	],
	verify: ["Vitest", "TypeScript", "Biome"],
	ship: ["Vercel"],
} as const;

export function StackStrip() {
	return (
		<Section spacing="compact">
			{/* mb-5 sits between the tight (mb-4) and default (mb-8) spacing
			steps; neither matches, so it stays on className. */}
			<SectionHeading kicker="stack" className="mb-5" />
			<Reveal>
				<Surface padding="sm" className="accent-surface space-y-4">
					{Object.entries(SKILLS).map(([group, skills]) => (
						<div key={group} className="flex flex-wrap items-center gap-2">
							<span className="kicker w-14 shrink-0">{group}</span>
							<ul className="flex flex-wrap gap-2">
								{skills.map((skill) => (
									<li key={skill}>
										{/* Same treatment as TechStack (project-patterns.tsx) — both
										render technology tags and should read as one recipe. */}
										<Badge
											variant="outline"
											className="font-mono text-xs font-normal"
										>
											{skill}
										</Badge>
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
