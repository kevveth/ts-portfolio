import { useEffect, useState } from "react";
import type { Activity } from "react-activity-calendar";
import { ActivityCalendar } from "react-activity-calendar";
import { ContentState } from "#/components/content-state";
import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { Surface } from "#/components/surface";
import { getCurrentTheme } from "#/lib/theme";

// ---------------------------------------------------------------------------
// Contribution theme — derived from the site's --border/--brand tokens.
// Each pair is [level-0 color, level-4 color]; react-activity-calendar
// interpolates the 3 middle levels in oklab space, so intermediate hex
// values never need to be hand-picked or kept in sync with styles.css.
// ---------------------------------------------------------------------------

const CONTRIBUTION_THEME = {
	light: ["#e1e1e4", "#156cdd"],
	dark: ["#262629", "#f14d4c"],
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
	// Must match the SSR-rendered value exactly or React logs a hydration
	// mismatch. Resolve the real theme (and start observing changes) only
	// after mount, inside the effect below.
	const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

	// react-activity-calendar auto-detects based on prefers-color-scheme, but
	// this site uses a class-based dark mode — we sync the prop explicitly.
	useEffect(() => {
		setColorScheme(getCurrentTheme());
		const observer = new MutationObserver(() => {
			setColorScheme(getCurrentTheme());
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => observer.disconnect();
	}, []);

	const hasActivity = data.some((d) => d.count > 0);

	if (!hasActivity) {
		return (
			<Section id="activity">
				<SectionHeading kicker="activity" title="GitHub contributions" />
				<Reveal>
					<ContentState>No contribution data available yet.</ContentState>
				</Reveal>
			</Section>
		);
	}

	return (
		<Section id="activity">
			<SectionHeading kicker="activity" title="GitHub contributions" />
			<Reveal>
				<Surface className="overflow-hidden p-4 sm:p-6">
					<ActivityCalendar
						data={data}
						theme={CONTRIBUTION_THEME}
						colorScheme={colorScheme}
						labels={LABELS}
						blockSize={14}
						blockMargin={4}
						blockRadius={3}
						fontSize={12}
					/>
				</Surface>
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
				<ContentState>{message}</ContentState>
			</Reveal>
		</Section>
	);
}
