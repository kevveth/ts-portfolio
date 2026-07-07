import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { cn } from "#/lib/utils";

type RevealProps = {
	children: ReactNode;
	className?: string;
};

/**
 * Fade/rise-on-scroll. The hidden initial state only exists under `html.js`
 * (stamped pre-paint by THEME_INIT_SCRIPT), so content is always visible for
 * no-JS visitors, and prefers-reduced-motion renders everything static.
 */
export function Reveal({ children, className }: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			node.classList.add("is-visible");
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						node.classList.add("is-visible");
						observer.disconnect();
					}
				}
			},
			{ threshold: 0, rootMargin: "0px 0px -40px 0px" },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={ref} className={cn("reveal", className)}>
			{children}
		</div>
	);
}
