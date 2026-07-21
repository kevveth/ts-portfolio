import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Section, SectionHeading } from "#/components/section";

/**
 * Measures the real computed font-size/weight/line-height of the sample
 * rendered inside this row, rather than hardcoding numbers that could drift
 * from styles.css. Runs post-hydration only, so SSR and first client paint
 * both show "measuring…" — no hydration mismatch.
 */
function useComputedFont(selector: string) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [computed, setComputed] = useState<string | null>(null);

	useEffect(() => {
		const node = containerRef.current?.querySelector<HTMLElement>(selector);
		if (!node) return;
		const style = getComputedStyle(node);
		setComputed(
			`${style.fontSize} · ${style.fontWeight} weight · ${style.lineHeight} line-height`,
		);
	}, [selector]);

	return [containerRef, computed] as const;
}

function TypeRow({
	label,
	selector,
	children,
}: {
	label: string;
	selector: string;
	children: ReactNode;
}) {
	const [sampleRef, computed] = useComputedFont(selector);

	return (
		<div className="space-y-3 border-b py-6 first:pt-0 last:border-b-0">
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<p className="metadata">{label}</p>
				<p className="font-mono text-xs text-muted-foreground">
					{computed ?? "measuring…"}
				</p>
			</div>
			{/* Scoped to just the sample (not the label row above), so a generic
			 * selector like "p" for the body-copy row can't accidentally match
			 * the label's own <p> elements instead of the actual sample. */}
			<div ref={sampleRef}>{children}</div>
		</div>
	);
}

export function TypeScaleSection() {
	return (
		<Section id="type-scale" divided>
			<SectionHeading kicker="foundations" title="Type scale" />
			<p className="mb-8 max-w-2xl text-sm text-muted-foreground">
				Every heading level and text recipe actually used on the site.
				Measurements on the right are read live from the rendered sample via{" "}
				<code>getComputedStyle</code>.
			</p>
			<div>
				<TypeRow label=".page-title" selector=".page-title">
					<h1 className="page-title">Design systems that don&apos;t drift.</h1>
				</TypeRow>
				<TypeRow label=".page-lede" selector=".page-lede">
					<p className="page-lede">
						A living reference for every token, primitive, and pattern this site
						ships — pulled straight from the real components.
					</p>
				</TypeRow>
				<TypeRow label=".kicker" selector=".kicker">
					<p className="kicker">
						<span aria-hidden>{"// "}</span>section label
					</p>
				</TypeRow>
				<TypeRow label=".metadata" selector=".metadata">
					<p className="metadata">
						Shipped Nov 2025 · TypeScript, TanStack Start, Tailwind v4
					</p>
				</TypeRow>
				<TypeRow label="body copy (no utility class)" selector="p">
					<p>
						The default paragraph style inherited from the document body — IBM
						Plex Sans at the base size and weight, used for prose that
						isn&apos;t a lede.
					</p>
				</TypeRow>
				<TypeRow label={'SectionHeading as="h2"'} selector="h2">
					<SectionHeading
						kicker="sample"
						title="A section heading"
						as="h2"
						spacing="none"
					/>
				</TypeRow>
				<TypeRow label={'SectionHeading as="h3"'} selector="h3">
					<SectionHeading
						kicker="sample"
						title="A subsection heading"
						as="h3"
						spacing="none"
					/>
				</TypeRow>
			</div>
		</Section>
	);
}
