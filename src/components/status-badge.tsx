import { Badge } from "#/components/ui/badge";
import type { ProjectStatus } from "#/content/projects";
import { cn } from "#/lib/utils";

const STATUS_META = {
	live: {
		label: "Live",
		dotClass: "bg-success",
		badgeClass: "border-success/40 bg-success/10 text-success-ink",
		live: true,
	},
	prototype: {
		label: "Prototype",
		dotClass: "bg-notice",
		badgeClass: "border-notice/40 bg-notice/10 text-notice-ink",
		live: false,
	},
	private: {
		label: "Private",
		dotClass: "bg-muted-foreground",
		badgeClass: "border-border bg-muted text-muted-foreground",
		live: false,
	},
} as const satisfies Record<
	ProjectStatus,
	{ label: string; dotClass: string; badgeClass: string; live: boolean }
>;

/**
 * Lifecycle status indicator for a project — a colored dot + label. The "live"
 * status pulses (disabled under prefers-reduced-motion).
 */
export function StatusBadge({
	status,
	className,
}: {
	status: ProjectStatus;
	className?: string;
}) {
	const meta = STATUS_META[status];

	return (
		<Badge
			variant="outline"
			className={cn(
				"gap-1.5 font-mono text-xs font-medium",
				meta.badgeClass,
				className,
			)}
		>
			<span aria-hidden className="relative flex size-2">
				{meta.live ? (
					<span
						className={cn(
							"absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:hidden",
							meta.dotClass,
						)}
					/>
				) : null}
				<span
					className={cn(
						"relative inline-flex size-2 rounded-full",
						meta.dotClass,
					)}
				/>
			</span>
			{meta.label}
		</Badge>
	);
}
