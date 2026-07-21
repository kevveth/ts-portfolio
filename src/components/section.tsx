import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

type SectionProps = {
	id?: string;
	className?: string;
	children: ReactNode;
	width?: "content" | "reading" | "wide";
	spacing?: "default" | "compact" | "flush" | "continued";
	divided?: boolean;
};

const widths = {
	content: "max-w-5xl",
	reading: "max-w-3xl",
	wide: "max-w-7xl",
} as const;

const spacings = {
	default: "py-14 sm:py-20",
	compact: "py-10 sm:py-12",
	flush: "py-0",
	/** Continues a preceding section: drops the top padding (the two
	 * sections read as one visual block) while keeping the default's
	 * bottom padding. */
	continued: "pt-0 pb-14 sm:pb-20",
} as const;

export function Section({
	id,
	className,
	children,
	width = "content",
	spacing = "default",
	divided = false,
}: SectionProps) {
	return (
		<section
			id={id}
			className={cn(
				"mx-auto w-full px-4 sm:px-6",
				widths[width],
				spacings[spacing],
				divided && "border-t",
				className,
			)}
		>
			{children}
		</section>
	);
}

type PageIntroProps = {
	kicker: string;
	title: string;
	description?: string;
	children?: ReactNode;
	className?: string;
};

export function PageIntro({
	kicker,
	title,
	description,
	children,
	className,
}: PageIntroProps) {
	return (
		<header className={cn("max-w-3xl space-y-4", className)}>
			<p className="kicker">
				<span aria-hidden>{"// "}</span>
				{kicker}
			</p>
			<h1 className="page-title">{title}</h1>
			{description ? <p className="page-lede">{description}</p> : null}
			{children}
		</header>
	);
}

type SectionHeadingProps = {
	kicker: string;
	title?: string;
	/** Heading level for the section's heading element. Defaults to "h2". */
	as?: "h1" | "h2" | "h3";
	/** Bottom margin before the heading's following content. Defaults to "default". */
	spacing?: "default" | "tight" | "none";
	className?: string;
};

const headingSpacings = {
	default: "mb-8",
	tight: "mb-4",
	none: "",
} as const;

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
	spacing = "default",
	className,
}: SectionHeadingProps) {
	const Heading = as;
	const kickerLabel = (
		<>
			<span aria-hidden>{"// "}</span>
			{kicker}
		</>
	);
	// h3 renders genuinely smaller than h2 so heading level is visible in the
	// type scale, not just semantics — both previously measured 30px/600/36px.
	const titleSizeClass =
		as === "h3" ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl";

	return (
		<div className={cn(headingSpacings[spacing], "space-y-2", className)}>
			{title ? (
				<>
					<p className="kicker">{kickerLabel}</p>
					<Heading
						className={cn(
							titleSizeClass,
							"font-semibold tracking-tight text-balance",
						)}
					>
						{title}
					</Heading>
				</>
			) : (
				<Heading className="kicker">{kickerLabel}</Heading>
			)}
		</div>
	);
}
