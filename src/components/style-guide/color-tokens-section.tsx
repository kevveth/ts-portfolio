import { Section, SectionHeading } from "#/components/section";

/**
 * Every color custom property defined in `:root` / `.dark` (src/styles.css),
 * grouped the same way styles.css groups them. Swatches read the CSS
 * variable directly via inline `style`, so this section can't drift from the
 * real tokens — there's no hardcoded hex/oklch anywhere below.
 */
type PairedToken = {
	label: string;
	base: string;
	foreground: string;
};

type SoloToken = {
	label: string;
	varName: string;
};

const PAIRED_TOKENS: PairedToken[] = [
	{
		label: "background / foreground",
		base: "background",
		foreground: "foreground",
	},
	{
		label: "card / card-foreground",
		base: "card",
		foreground: "card-foreground",
	},
	{
		label: "popover / popover-foreground",
		base: "popover",
		foreground: "popover-foreground",
	},
	{
		label: "primary / primary-foreground",
		base: "primary",
		foreground: "primary-foreground",
	},
	{
		label: "secondary / secondary-foreground",
		base: "secondary",
		foreground: "secondary-foreground",
	},
	{
		label: "muted / muted-foreground",
		base: "muted",
		foreground: "muted-foreground",
	},
	{
		label: "accent / accent-foreground",
		base: "accent",
		foreground: "accent-foreground",
	},
	{
		label: "destructive / destructive-foreground",
		base: "destructive",
		foreground: "destructive-foreground",
	},
];

const SOLO_TOKENS: SoloToken[] = [
	{ label: "brand", varName: "brand" },
	{ label: "brand-ink", varName: "brand-ink" },
	{ label: "signal", varName: "signal" },
	{ label: "border", varName: "border" },
	{ label: "input", varName: "input" },
	{ label: "ring", varName: "ring" },
];

const CANVAS_TOKENS: SoloToken[] = [
	{ label: "hero-color-1", varName: "hero-color-1" },
	{ label: "hero-color-2", varName: "hero-color-2" },
];

function PairedSwatch({ base, foreground }: PairedToken) {
	return (
		<div className="space-y-2">
			<div
				className="flex h-20 items-center justify-center rounded-lg border"
				style={{
					backgroundColor: `var(--${base})`,
					color: `var(--${foreground})`,
				}}
			>
				<span className="font-mono text-sm font-semibold">Aa</span>
			</div>
			<p className="metadata">
				--{base}
				<br />
				--{foreground}
			</p>
		</div>
	);
}

function SoloSwatch({ varName }: SoloToken) {
	return (
		<div className="space-y-2">
			<div
				className="h-20 rounded-lg border"
				style={{ backgroundColor: `var(--${varName})` }}
			/>
			<p className="metadata">--{varName}</p>
		</div>
	);
}

export function ColorTokensSection() {
	return (
		<>
			<Section id="colors" width="wide">
				<SectionHeading kicker="tokens" title="Color tokens" />
				<p className="mb-6 max-w-2xl text-sm text-muted-foreground">
					Every CSS custom property in <code>:root</code> / <code>.dark</code>{" "}
					(src/styles.css). Paired tokens render the base color with its
					matching foreground sampled on top; solo tokens are single-purpose
					(borders, rings, brand accents). Use the theme toggle in the header to
					check the dark variants.
				</p>
				<h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
					Paired tokens
				</h3>
				<div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
					{PAIRED_TOKENS.map((token) => (
						<PairedSwatch key={token.label} {...token} />
					))}
				</div>
				<h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
					Solo tokens
				</h3>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					{SOLO_TOKENS.map((token) => (
						<SoloSwatch key={token.varName} {...token} />
					))}
				</div>
			</Section>
			<Section width="wide" spacing="continued">
				<SectionHeading kicker="hero canvas" as="h3" spacing="none" />
				<p className="mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
					<code>--hero-color-1</code> / <code>--hero-color-2</code> are
					alpha-blended gradient endpoints consumed by the hero canvas
					(src/components/hero-blobs.tsx), not general-purpose UI tokens — shown
					here for completeness since they live in the same <code>:root</code>{" "}
					block.
				</p>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					{CANVAS_TOKENS.map((token) => (
						<SoloSwatch key={token.varName} {...token} />
					))}
				</div>
			</Section>
		</>
	);
}
