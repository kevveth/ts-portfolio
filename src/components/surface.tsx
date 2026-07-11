import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

type SurfaceProps = ComponentProps<"div"> & {
	variant?: "plain" | "raised" | "interactive";
};

const variants = {
	plain: "border bg-card",
	raised: "border bg-card shadow-sm",
	interactive:
		"border bg-card shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md focus-within:border-brand/50",
} as const;

export function Surface({
	variant = "plain",
	className,
	...props
}: SurfaceProps) {
	return (
		<div
			data-slot="surface"
			data-variant={variant}
			className={cn("rounded-lg", variants[variant], className)}
			{...props}
		/>
	);
}
