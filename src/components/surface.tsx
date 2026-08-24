import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

type SurfaceProps = ComponentProps<"div"> & {
	/**
	 * Element to render. A small closed union rather than a generic
	 * ElementType: these are the only tags whose semantics fit a surface,
	 * and they all take the same props as a div.
	 */
	as?: "div" | "article" | "figure";
	variant?: "plain" | "raised" | "interactive";
	/** Uniform padding scale. Defaults to "none" since most callers still
	 * apply their own (often asymmetric) padding via className. */
	padding?: "none" | "sm" | "md" | "lg";
};

const variants = {
	plain: "border bg-card",
	raised: "border bg-card shadow-sm",
	interactive:
		"border bg-card shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md focus-within:border-brand/50",
} as const;

const paddings = {
	none: "",
	sm: "p-4 sm:p-5",
	md: "p-5 sm:p-6",
	lg: "p-6 sm:p-8",
} as const;

export function Surface({
	as: Component = "div",
	variant = "plain",
	padding = "none",
	className,
	...props
}: SurfaceProps) {
	return (
		<Component
			data-slot="surface"
			data-variant={variant}
			className={cn(
				"rounded-lg",
				variants[variant],
				paddings[padding],
				className,
			)}
			{...props}
		/>
	);
}
