import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

type SectionProps = {
	id?: string;
	className?: string;
	children: ReactNode;
};

export function Section({ id, className, children }: SectionProps) {
	return (
		<section
			id={id}
			className={cn(
				"mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20",
				className,
			)}
		>
			{children}
		</section>
	);
}

type SectionHeadingProps = {
	kicker: string;
	title?: string;
	/** Heading level for the section's heading element. Defaults to "h2". */
	as?: "h1" | "h2" | "h3";
	className?: string;
};

/**
 * Section label + optional title. When `title` is set it is the section's
 * heading (level `as`, default h2) and the kicker is a decorative label; when
 * only `kicker` is given the kicker itself becomes the heading (still styled as
 * a small mono label) so every section contributes a heading to the outline.
 */
export function SectionHeading({
	kicker,
	title,
	as = "h2",
	className,
}: SectionHeadingProps) {
	const Heading = as;
	const kickerLabel = (
		<>
			<span aria-hidden className="text-brand">
				{"// "}
			</span>
			{kicker}
		</>
	);

	return (
		<div className={cn("mb-8 space-y-2", className)}>
			{title ? (
				<>
					<p className="kicker">{kickerLabel}</p>
					<Heading className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
						{title}
					</Heading>
				</>
			) : (
				<Heading className="kicker">{kickerLabel}</Heading>
			)}
		</div>
	);
}
