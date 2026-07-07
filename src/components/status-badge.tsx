import { Badge } from "#/components/ui/badge";
import { getStatusMeta, type ProjectStatus } from "#/content/projects";
import { cn } from "#/lib/utils";

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
	const meta = getStatusMeta(status);

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
