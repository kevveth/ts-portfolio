import { ActivityCalendar } from "react-activity-calendar";
import type { Activity } from "react-activity-calendar";
import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";

// ---------------------------------------------------------------------------
// Zinc-scale contribution theme (matches site's visual identity)
// Light: low → high activity = light → dark zinc
// Dark:  low → high activity = dark → light (inverted for contrast)
// ---------------------------------------------------------------------------

const ZINC_THEME = {
	light: ["#f4f4f5", "#d4d4d8", "#a1a1aa", "#71717a", "#3f3f46"],
	dark: ["#3f3f46", "#52525b", "#71717a", "#a1a1aa", "#d4d4d8"],
};

// ---------------------------------------------------------------------------
// Labels — minimal: only total count, no month/weekday labels
// ---------------------------------------------------------------------------

const LABELS = {
	totalCount: "{{count}} contributions in the last year",
} as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type ContributionGraphProps = {
	data: Activity[];
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContributionGraph({ data }: ContributionGraphProps) {
	const hasActivity = data.some((d) => d.count > 0);

	if (!hasActivity) {
		return (
			<Section id="activity">
				<SectionHeading kicker="activity" title="GitHub contributions" />
				<Reveal>
					<div className="rounded-lg border bg-card p-8 text-center">
						<p className="text-sm text-muted-foreground">
							No contribution data available yet.
						</p>
					</div>
				</Reveal>
			</Section>
		);
	}

	return (
		<Section id="activity">
			<SectionHeading kicker="activity" title="GitHub contributions" />
			<Reveal>
				<div className="overflow-hidden rounded-lg border bg-card p-4 sm:p-6">
					<div className="[&_svg]:mx-auto">
						<ActivityCalendar
							data={data}
							theme={ZINC_THEME}
							labels={LABELS}
							blockSize={14}
							blockMargin={4}
							blockRadius={3}
							fontSize={12}
						/>
					</div>
				</div>
			</Reveal>
		</Section>
	);
}

// ---------------------------------------------------------------------------
// Error fallback — shown when the fetch fails
// ---------------------------------------------------------------------------

export function ContributionGraphError({ message }: { message: string }) {
	return (
		<Section id="activity">
			<SectionHeading kicker="activity" title="GitHub contributions" />
			<Reveal>
				<div className="rounded-lg border bg-card p-8 text-center">
					<p className="text-sm text-muted-foreground">{message}</p>
				</div>
			</Reveal>
		</Section>
	);
}
