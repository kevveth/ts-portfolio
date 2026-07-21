import { Section, SectionHeading } from "#/components/section";

/**
 * Tailwind v4's default numeric spacing scale (1 unit = 0.25rem) — this app
 * doesn't override `--spacing` in the `@theme` block in styles.css, so these
 * utilities are the real scale used everywhere (gap-*, p-*, space-y-*, etc).
 */
const SPACING_STEPS = [
	{ token: "1", className: "w-1", rem: "0.25rem", px: "4px" },
	{ token: "2", className: "w-2", rem: "0.5rem", px: "8px" },
	{ token: "3", className: "w-3", rem: "0.75rem", px: "12px" },
	{ token: "4", className: "w-4", rem: "1rem", px: "16px" },
	{ token: "5", className: "w-5", rem: "1.25rem", px: "20px" },
	{ token: "6", className: "w-6", rem: "1.5rem", px: "24px" },
	{ token: "8", className: "w-8", rem: "2rem", px: "32px" },
	{ token: "10", className: "w-10", rem: "2.5rem", px: "40px" },
	{ token: "12", className: "w-12", rem: "3rem", px: "48px" },
	{ token: "16", className: "w-16", rem: "4rem", px: "64px" },
	{ token: "20", className: "w-20", rem: "5rem", px: "80px" },
	{ token: "24", className: "w-24", rem: "6rem", px: "96px" },
] as const;

/**
 * `--radius-*` are defined in the `@theme inline` block in styles.css, all
 * derived from the single `--radius: 0.5rem` base (same value in both
 * themes). `full` isn't part of that scale but is used throughout (Badge,
 * pill buttons), so it's included for completeness.
 */
const RADIUS_STEPS = [
	{ token: "--radius-sm", className: "rounded-sm", value: "0.25rem (4px)" },
	{ token: "--radius-md", className: "rounded-md", value: "0.375rem (6px)" },
	{
		token: "--radius-lg",
		className: "rounded-lg",
		value: "0.5rem (8px) — base --radius",
	},
	{ token: "--radius-xl", className: "rounded-xl", value: "0.75rem (12px)" },
	{ token: "full", className: "rounded-full", value: "9999px" },
] as const;

export function SpacingRadiusSection() {
	return (
		<Section id="spacing-radius" divided>
			<SectionHeading kicker="foundations" title="Spacing & radius" />
			<div className="space-y-10">
				<div>
					<h3 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
						Spacing scale (Tailwind default, 1 = 0.25rem)
					</h3>
					<div className="space-y-2">
						{SPACING_STEPS.map((step) => (
							<div key={step.token} className="flex items-center gap-4">
								<p className="w-8 shrink-0 font-mono text-xs text-muted-foreground">
									{step.token}
								</p>
								<div
									className={`h-3 shrink-0 rounded-sm bg-brand ${step.className}`}
								/>
								<p className="font-mono text-xs text-muted-foreground">
									{step.rem} / {step.px}
								</p>
							</div>
						))}
					</div>
				</div>
				<div>
					<h3 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
						Radius scale
					</h3>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
						{RADIUS_STEPS.map((step) => (
							<div key={step.token} className="space-y-2">
								<div
									className={`h-16 w-16 border bg-muted ${step.className}`}
								/>
								<p className="font-mono text-xs text-muted-foreground">
									{step.token}
								</p>
								<p className="text-xs text-muted-foreground">{step.value}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</Section>
	);
}
