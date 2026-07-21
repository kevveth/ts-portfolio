import { useEffect, useState } from "react";
import type { Activity } from "react-activity-calendar";
import { ActivityCalendar } from "react-activity-calendar";
import { ContentState } from "#/components/content-state";
import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { Surface } from "#/components/surface";
import { SITE } from "#/content/site";
import { useTheme } from "#/lib/theme";

// ---------------------------------------------------------------------------
// Contribution theme — derived from the site's --border/--brand-ink tokens.
// Each pair is [level-0 color, level-4 color]; react-activity-calendar
// interpolates the 3 middle levels in oklab space, so intermediate hex
// values never need to be hand-picked or kept in sync with styles.css.
//
// react-activity-calendar's color interpolation runs in plain JS (not CSS),
// so it can't resolve `var(--foo)` reference strings — it needs literal
// colors it can parse. Reading `getComputedStyle(...).getPropertyValue`
// for a custom property returns the raw authored token text (e.g. the
// literal string "oklch(0.72 0.19 25)"), not a guaranteed-parseable value,
// so instead we apply each token as a real `color` on a throwaway element
// and read the browser's resolved `rgb(...)` serialization back off it —
// that's guaranteed parseable by any JS color library.
//
// --brand-ink is used (not raw --brand) for the "peak activity" stop
// because it's the token already tuned per-theme to read well as a small
// graphic against the page background (in light mode it equals --brand; in
// dark mode it's the lighter crimson tint), so one lookup works for both
// themes without branching. --border is the neutral "no activity" base in
// both themes for the same reason.
// ---------------------------------------------------------------------------

/** Fallback shown until the client-side effect resolves the real tokens (avoids a colorless flash before mount). */
const FALLBACK_THEME = {
	light: ["#e1e4e7", "#0061ce"],
	dark: ["#29272d", "#f05a65"],
};

function resolveCssColor(varName: string): string | null {
	if (typeof document === "undefined") return null;
	const probe = document.createElement("span");
	probe.style.color = `var(${varName})`;
	probe.style.display = "none";
	document.body.appendChild(probe);
	const resolved = getComputedStyle(probe).color;
	document.body.removeChild(probe);
	return resolved || null;
}

/**
 * Resolves the current theme (see #/lib/theme's hydration-safe caveat) and,
 * alongside it, the contribution-calendar color pair read from the real
 * tokens. Returned together since the calendar needs both.
 */
function useContributionTheme() {
	const colorScheme = useTheme();
	const [calendarTheme, setCalendarTheme] = useState(FALLBACK_THEME);

	// biome-ignore lint/correctness/useExhaustiveDependencies: colorScheme isn't read in the body, but it's the signal that the .dark class (and so the cascaded --border/--brand-ink values) just changed — exactly when this needs to re-run.
	useEffect(() => {
		const base = resolveCssColor("--border");
		const peak = resolveCssColor("--brand-ink");
		if (!base || !peak) return;
		// Only the array matching the active colorScheme is ever rendered, so
		// both slots can safely hold the same freshly-read pair — the "other"
		// theme's slot gets recomputed the moment colorScheme flips again.
		setCalendarTheme({ light: [base, peak], dark: [base, peak] });
	}, [colorScheme]);

	return { colorScheme, calendarTheme };
}

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
	// after mount, inside the hook below.
	const { colorScheme, calendarTheme } = useContributionTheme();

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
				{/* p-4 sm:p-6 falls between the sm (p-4 sm:p-5) and md (p-5 sm:p-6)
				padding steps; neither matches both breakpoints, so it stays on
				className rather than changing the rendered padding. */}
				<Surface className="accent-surface overflow-hidden p-4 sm:p-6">
					<ActivityCalendar
						data={data}
						theme={calendarTheme}
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

export function ContributionGraphError() {
	return (
		<Section id="activity">
			<SectionHeading kicker="activity" title="GitHub contributions" />
			<Reveal>
				<ContentState>
					Contribution data isn&apos;t available right now. You can{" "}
					<a className="text-brand underline" href={SITE.github}>
						see the live graph on GitHub
					</a>
					.
				</ContentState>
			</Reveal>
		</Section>
	);
}
