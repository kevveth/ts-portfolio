import type { ReactNode } from "react";
import { Surface } from "#/components/surface";

export function ContentState({ children }: { children: ReactNode }) {
	return (
		// Flat p-8 doesn't fit the padding scale (sm/md/lg all step up between
		// base and sm breakpoints); forcing the nearest option (lg, p-6 sm:p-8)
		// would shrink mobile padding, so it stays on className.
		<Surface className="p-8 text-center" role="status">
			<p className="text-sm text-muted-foreground">{children}</p>
		</Surface>
	);
}
