import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "#/lib/utils";

/**
 * Vendored from `ui-library`'s Button because that dependency shipped an
 * unlayered `:root` block that silently outranked this app's own `@theme`
 * tokens. Keeping the component local makes ownership explicit: this file
 * owns the full variant surface against this app's real tokens.
 *
 * `default` and `brand-link` reference `.portfolio-primary` / `.portfolio-link`
 * (src/styles.css) for the hover-lift shadow and the gradient-sweep
 * underline — effects that don't reduce to plain utility classes. Those
 * classes are baked in here as part of the variant; consumers should never
 * need to pass them via `className` again.
 */
const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
	{
		variants: {
			variant: {
				default:
					"portfolio-primary border-transparent bg-primary text-primary-foreground",
				secondary:
					"border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline:
					"border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
				ghost:
					"border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
				link: "border-transparent bg-transparent text-primary underline-offset-4 hover:underline",
				/** CTA-style link: brand/signal gradient underline sweep, 44px hit target. */
				"brand-link":
					"portfolio-link border-transparent bg-transparent text-foreground",
			},
			size: {
				default: "h-9 px-4 text-sm",
				xs: "h-6 gap-1 px-2 text-xs",
				sm: "h-9 px-3 text-sm",
				lg: "h-11 px-6 text-base",
				icon: "size-9 p-0",
				"icon-xs": "size-6 p-0",
				"icon-sm": "size-8 p-0",
				"icon-lg": "size-10 p-0",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
